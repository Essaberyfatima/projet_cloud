from fastapi import APIRouter
from datetime import datetime
from models.schemas import TransformRequest, TransformResponse
from services.transformer import transform_data

router = APIRouter()

# In-memory storage for the last 10 transformations
transformation_history = []

@router.post("/transform", response_model=TransformResponse)
def transform_endpoint(request: TransformRequest):
    try:
        output_data = transform_data(
            request.input_data, 
            request.input_format, 
            request.output_format
        )
        status = "success"
        message = "Transformation successful"
    except ValueError as e:
        output_data = ""
        status = "error"
        message = str(e)
    except Exception as e:
        output_data = ""
        status = "error"
        message = f"An unexpected error occurred: {str(e)}"
        
    # Record history
    history_entry = {
        "timestamp": datetime.now().isoformat(),
        "input_format": request.input_format,
        "output_format": request.output_format,
        "input_data": request.input_data,
        "status": status
    }
    
    transformation_history.insert(0, history_entry)
    if len(transformation_history) > 10:
        transformation_history.pop()
        
    return TransformResponse(
        output_data=output_data,
        status=status,
        message=message
    )

@router.get("/history")
def get_history():
    return transformation_history
