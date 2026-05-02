from pydantic import BaseModel, Field
from typing import Literal

class TransformRequest(BaseModel):
    input_data: str = Field(..., min_length=1, description="Data to be transformed")
    input_format: Literal["json", "csv", "xml"]
    output_format: Literal["json", "csv", "xml"]

class TransformResponse(BaseModel):
    output_data: str = ""
    status: Literal["success", "error"]
    message: str

class HistoryEntry(BaseModel):
    timestamp: str
    input_format: str
    output_format: str
    input_data: str
    status: Literal["success", "error"]
    message: str
