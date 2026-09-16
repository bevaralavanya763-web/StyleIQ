from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import StreamingResponse
from PIL import Image
from io import BytesIO
import sys

# FASHN source code
sys.path.insert(0, "/app/fashn-vton-1.5/src")

from fashn_vton import TryOnPipeline

app = FastAPI(
    title="StyleIQ Virtual Try-On API",
    version="1.0"
)

print("Loading FASHN VTON model...")

pipeline = TryOnPipeline(
    weights_dir="/app/fashn-vton-1.5/weights"
)

print("FASHN VTON model loaded successfully!")


@app.get("/")
def home():
    return {
        "status": "online",
        "service": "StyleIQ Virtual Try-On API"
    }


@app.post("/tryon")
async def tryon(
    person_image: UploadFile = File(...),
    garment_image: UploadFile = File(...),
    category: str = Form("tops")
):

    person_bytes = await person_image.read()
    garment_bytes = await garment_image.read()

    person = Image.open(
        BytesIO(person_bytes)
    ).convert("RGB")

    garment = Image.open(
        BytesIO(garment_bytes)
    ).convert("RGB")

    print("Running FASHN Virtual Try-On...")

    result = pipeline(
        person_image=person,
        garment_image=garment,
        category=category,
        garment_photo_type="flat-lay",
        num_samples=1,
        num_timesteps=30,
        guidance_scale=1.5,
        seed=42,
        segmentation_free=True,
    )

    output_image = result.images[0]

    buffer = BytesIO()

    output_image.save(
        buffer,
        format="PNG"
    )

    buffer.seek(0)

    print("Virtual Try-On completed!")

    return StreamingResponse(
        buffer,
        media_type="image/png"
    )
