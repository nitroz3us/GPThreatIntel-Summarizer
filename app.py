import openai
import uvicorn
import requests
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseSettings
from bs4 import BeautifulSoup



class Settings(BaseSettings):
    OPENAI_API_KEY: str = 'OPENAI_API_KEY'

    class Config:
        env_file = '.env'

settings = Settings()
openai.api_key = settings.OPENAI_API_KEY

app = FastAPI()

templates = Jinja2Templates(directory="src/templates")
app.mount("/static", StaticFiles(directory="src/static"), name="static")


# Step 1: Extract using BeautifulSoup
def extract_text(url):
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

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/", response_class=HTMLResponse)
async def index(request: Request, url: str= Form(...)):
    #display the extracted text inputted by the user in a textfield form
    result = extract_text(url)
    print(result)
    return templates.TemplateResponse("index.html", {"request": request, "result": result})

if __name__ == "__main__":
    uvicorn.run('app:app', host="localhost", port=5001, reload=True)