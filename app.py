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
import os
import markdown
from fastapi import FastAPI, Request, Form, HTTPException, File, UploadFile
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseSettings
from bs4 import BeautifulSoup
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from pypdf import PdfReader


UPLOAD_DIR = Path() / 'uploads'

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
    
# Handle text input and url input
def extract_text(data):
    if data.startswith("http://") or data.startswith("https://"):
        return extract_text_from_url(data)
    else:
        return extract_text_from_text(data)


def process_text_with_openai(report, max_tokens):
    # Edit this later!
    prompt="You are a Cyber Threat Intelligence Analyst and need to summarise a report for upper management. The report must be nicely formatted with three sections: one Executive Summary section and one 'TTPs and IoCs' section and one Mitigation Recommendation. The second section shall list all IP addresses, domains, URLs, tools and hashes (sha-1, sha256, md5, etc.) if can be found in the report. If IoCs ONLY are not found in the report, return N/A, if there are TTP's, process as per normal. Nicely format the report as markdown. Use newlines between markdown headings.",
    # prompt += text
    text = f'{prompt}\n\n"""{report}"""'
    print("Print text & prompt: \n" + text)

    result = openai.Completion.create(
        engine="text-davinci-003",
        prompt=text,
        temperature=0.3,
        max_tokens=500,
        top_p=0.2,
        frequency_penalty=0,
        presence_penalty=0
    )
    return result.choices[0].text.strip()


@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/", response_class=HTMLResponse)
async def index(request: Request, data: str = Form(None), file_upload: UploadFile = File(None), openAIKey: str = Form(...), word_count: int = Form(100)):
    openai.api_key = openAIKey

    # Handle PDF input
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

        result = process_text_with_openai(output, word_count)
        print("Print output: \n" + result)
        result = markdown.markdown(result) 
        return result
    if data is not None:
        # Process text/url input
        output = extract_text(data)
        result = process_text_with_openai(output, word_count)
        print("Print output: \n" + result)
        result = markdown.markdown(result)
        return result
    else:
        # Handle case when no data is provided
        return "No input data provided"


if __name__ == "__main__":
    uvicorn.run('app:app', host="localhost", port=5001, reload=True)