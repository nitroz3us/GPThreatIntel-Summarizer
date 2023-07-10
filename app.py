# /**
#  * @license MIT
#  * 
#  * Written by nitroz3us
#  * Github: https://github.com/nitroz3us
#  * Repository: https://github.com/nitroz3us/GPThreatIntel-Summarizer
#  * 
#  * You're free to use this library as long as you keep this statement in this file
#  */

import openai
import uvicorn
import requests
import io
# import PyPDF2
from fastapi import FastAPI, Request, Form, HTTPException, File, UploadFile
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseSettings
from bs4 import BeautifulSoup
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader
from typing import Annotated, Union


UPLOAD_DIR = Path() / 'uploads'


class Settings(BaseSettings):
    OPENAI_API_KEY: str = 'OPENAI_API_KEY'

    class Config:
        env_file = '.env'

settings = Settings()
openai.api_key = settings.OPENAI_API_KEY

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    # define the allowed origins explicitly, currently this wildcard is NOT recommended
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory="src/templates")
app.mount("/static", StaticFiles(directory="src/static"), name="static")

# Handle URL input
def extract_text_from_url(url):
    response = requests.get(url)
    # Check if the request was successful
    if response.status_code == 200:
    # Parse the HTML content using BeautifulSoup
        soup = BeautifulSoup(response.content, 'html.parser')

        # Identify specific HTML elements or tags that contain the desired text
        # For example, you can use 'p' for paragraphs, 'h1' for headings, etc.
        text_elements = soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

        # Extract text content from the elements
        text = [element.get_text() for element in text_elements]

        # Join the extracted text into a single string
        extracted_text = ' '.join(text)

        return extracted_text
    else:
        # Handle any errors or invalid responses
        print(f"Request to {url} failed with status code {response.status_code}")
        return None

# Handle text input
def extract_text_from_text(text):
    # get content from html tag and return it
    return text
    


def extract_text(data):
    if data.startswith("http://") or data.startswith("https://"):
        return extract_text_from_url(data)
    else:
        return extract_text_from_text(data)

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/", response_class=HTMLResponse)
async def index(request: Request, data: str = Form(None), file_upload: UploadFile = File(None)):
    # file_upload = ''
    print(file_upload)
    if file_upload is not None:
        # Process file upload
        data = await file_upload.read()
        save_to = UPLOAD_DIR / file_upload.filename
        with open(save_to, 'wb') as f:
            f.write(data)

        # read the pdf file
        output = ""
        pdf = PdfReader(save_to)
        number_of_pages = len(pdf.pages)
        for i in range(number_of_pages):
            page = pdf.pages[i]
            text = page.extract_text()
            output += text
        # Remove the /n in the output & the quotatation in the output
        output = output.replace('\n','')
        output = output.replace('"','')

        print("Print PDF text: \n" + output)

        return output
    if data is not None:
        # Process text/url input
        output = extract_text(data)
        print(output)
        return output
    else:
        # Handle case when no data is provided
        return "No input data provided"

    # # Integrate with OpenAI API here if needed
    # print(output)


# @app.post("/", response_class=HTMLResponse)
# async def index(request: Request, data: str= Form(...)):
#     result = extract_text(data)
#     # Integrate with OpenAI API here soon
#     print(result)
#     return result
#     return templates.TemplateResponse("index.html", {"request": request, "result": result, "url": url})

# @app.post("/")
# async def create_upload_file(file_upload: Union[UploadFile, None] = None):
#     data = await file_upload.read()
#     save_to = UPLOAD_DIR / file_upload.filename
#     with open(save_to, 'wb') as f:
#         f.write(data)

#     # read the pdf file
#     output = ""
#     pdf = PdfReader(save_to)
#     number_of_pages = len(pdf.pages)
#     for i in range(number_of_pages):
#         page = pdf.pages[i]
#         text = page.extract_text()
#         output += text
#     # remove trailing spaces
#     # Remove the /n in the output & the quotatation in the output
#     output = output.replace('\n','')
#     output = output.replace('"','')

#     print("Print PDF text: \n" + output)

#     return output

# @app.post("/", response_class=HTMLResponse)
# async def index(request: Request, data: UploadFile = File(...)):
#     content_type = data.content_type
#     print("Print content-type: " + content_type)
#     if content_type.startswith("application/octet-stream"):
#         dataRead = await data.read()
#         result = extract_text(dataRead.decode())
#     elif content_type == "application/pdf":
#         result = extract_text_from_pdf(data.data)
#     else:
#         result = None
    
#     return result



if __name__ == "__main__":
    uvicorn.run('app:app', host="localhost", port=5001, reload=True)