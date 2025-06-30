from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List
import uvicorn
from datetime import datetime, timezone
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import os
from contextlib import asynccontextmanager
from fastapi.concurrency import run_in_threadpool
from scrapegraphai.graphs import SmartScraperGraph
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")

# Define the configuration for the scraping pipeline
graph_config = {
    "llm": {
        "api_key": api_key,
        "model": "openai/gpt-4o-mini",
    },
    "verbose": True,
    "headless": True,
}

# Run the pipeline
def scrape(prompt: str, source: str):
    result = SmartScraperGraph(
        prompt=prompt,
        source=source,
        config=graph_config
    ).run()
    return result

# Models
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional

class ApplicationCreate(BaseModel):
    company: str
    role: str
    salary: Optional[str] = None
    platform: str
    status: str = "Postulado"
    contact: Optional[str] = None
    jobUrl: HttpUrl
    phone_number: str
    interview: Optional[datetime] = None
    feedback: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    salary: Optional[str] = None
    platform: Optional[str] = None
    status: Optional[str] = None
    contact: Optional[str] = None
    jobUrl: Optional[HttpUrl] = None
    interview: Optional[datetime] = None
    feedback: Optional[str] = None

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ApplicationResponse(BaseModel):
    id: str = Field(alias="_id")
    company: str
    role: str
    salary: Optional[str] = None
    platform: str
    status: str
    contact: Optional[str] = None
    jobUrl: str
    phone_number: str
    interview: Optional[datetime] = None
    feedback: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
    __v: int = 0

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            ObjectId: str
        }

## Scrape
class ScrapeModel(BaseModel):
    source: str

# Database connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "job_applications_db"
COLLECTION_NAME = "applications"

class Database:
    client: AsyncIOMotorClient = None
    database = None
    collection = None

db = Database()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    db.client = AsyncIOMotorClient(MONGODB_URL)
    db.database = db.client[DATABASE_NAME]
    db.collection = db.database[COLLECTION_NAME]
    
    # Create indexes
    await db.collection.create_index("phone_number")
    await db.collection.create_index("active")
    
    yield
    
    # Shutdown
    db.client.close()

# Repository layer
class ApplicationRepository:
    def __init__(self, collection):
        self.collection = collection

    async def find_by_phone_number(self, phone_number: str) -> List[dict]:
        cursor = self.collection.find({
            "phone_number": phone_number,
            "active": True
        })
        applications = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            applications.append(doc)
        return applications

    async def create(self, application_data: dict) -> dict:
        now = datetime.now(timezone.utc)
        application_data.update({
            "active": True,
            "createdAt": now,
            "updatedAt": now,
            "__v": 0
        })
        
        # Convert HttpUrl to string and remove None values
        if "jobUrl" in application_data:
            application_data["jobUrl"] = str(application_data["jobUrl"])
        
        application_data = {k: v for k, v in application_data.items() if v is not None}
        
        result = await self.collection.insert_one(application_data)
        application_data["_id"] = str(result.inserted_id)
        return application_data

    async def find_by_id(self, application_id: str) -> Optional[dict]:
        if not ObjectId.is_valid(application_id):
            return None
        
        doc = await self.collection.find_one({
            "_id": ObjectId(application_id),
            "active": True
        })
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def update(self, application_id: str, update_data: dict) -> Optional[dict]:
        if not ObjectId.is_valid(application_id):
            return None
        
        # Convert HttpUrl to string and remove None values
        if "jobUrl" in update_data:
            update_data["jobUrl"] = str(update_data["jobUrl"])
        
        update_data = {k: v for k, v in update_data.items() if v is not None}
        if update_data:
            update_data["updatedAt"] = datetime.now(timezone.utc)
            
            result = await self.collection.update_one(
                {"_id": ObjectId(application_id), "active": True},
                {"$set": update_data, "$inc": {"__v": 1}}
            )
            
            if result.modified_count:
                return await self.find_by_id(application_id)
        return None

    async def deactivate(self, application_id: str) -> bool:
        if not ObjectId.is_valid(application_id):
            return False
        
        result = await self.collection.update_one(
            {"_id": ObjectId(application_id), "active": True},
            {
                "$set": {"active": False, "updatedAt": datetime.now(timezone.utc)},
                "$inc": {"__v": 1}
            }
        )
        return result.modified_count > 0

# Service layer
class ApplicationService:
    def __init__(self, repository: ApplicationRepository):
        self.repository = repository

    async def get_applications_by_phone(self, phone_number: str) -> List[ApplicationResponse]:
        applications = await self.repository.find_by_phone_number(phone_number)
        return [ApplicationResponse(**app) for app in applications]

    async def create_application(self, application: ApplicationCreate) -> ApplicationResponse:
        application_dict = application.model_dump()
        created_app = await self.repository.create(application_dict)
        return ApplicationResponse(**created_app)

    async def update_application(self, application_id: str, update_data: ApplicationUpdate) -> ApplicationResponse:
        update_dict = update_data.model_dump(exclude_unset=True)
        updated_app = await self.repository.update(application_id, update_dict)
        print("updated_app:", updated_app)
        if not updated_app:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return ApplicationResponse(**updated_app)

    async def delete_application(self, application_id: str) -> bool:
        success = await self.repository.deactivate(application_id)
        if not success:
            raise HTTPException(status_code=404, detail="Application not found")
        return True

# FastAPI app
app = FastAPI(
    title="Job Applications API",
    description="API para gestionar postulaciones de trabajo",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize service
def get_application_service() -> ApplicationService:
    repository = ApplicationRepository(db.collection)
    return ApplicationService(repository)

# Routes
## Applications
@app.get("/applications", response_model=List[ApplicationResponse])
async def get_applications(
    phone_number: str = Query(..., description="Número de teléfono del usuario")
):
    """Recupera todas las postulaciones activas por número de teléfono"""
    service = get_application_service()
    return await service.get_applications_by_phone(phone_number)

@app.post("/applications", response_model=ApplicationResponse)
async def create_application(application: ApplicationCreate):
    """Crear una nueva postulación"""
    service = get_application_service()
    return await service.create_application(application)

@app.patch("/applications/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: str = Path(..., description="ID de la postulación"),
    update_data: ApplicationUpdate = None
):
    """Actualizar parcialmente una postulación"""
    service = get_application_service()
    print("update_data", update_data)
    return await service.update_application(application_id, update_data)

@app.delete("/applications/{application_id}")
async def delete_application(
    application_id: str = Path(..., description="ID de la postulación")
):
    """Desactivar una postulación"""
    service = get_application_service()
    await service.delete_application(application_id)
    return {"message": "Application deactivated successfully"}

@app.post("/scrape")
async def scrape_job_offer(model: ScrapeModel):
    """Scrape a job offer"""
    body = model.model_dump()
    response = await run_in_threadpool(
        scrape,
        prompt="Extract information from the job posting: company, role (job position), salary (+ currency) if applicable, contact (email or phone number of a recruiter) if applicable, requirements(array). If there are multiple job postings, focus only on the one with the longest description. You should only return a JSON object.",
        source=body['source'],
    )
    return response

@app.get("/")
async def root():
    return {"message": "Job Applications API is running!"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)