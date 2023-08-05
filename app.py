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
import markdown
import pdfplumber
import io
from fastapi import FastAPI, Request, Form, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from bs4 import BeautifulSoup
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware


# UPLOAD_DIR = Path() / 'uploads'

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
    user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"

    headers = {
        "User-Agent": user_agent
    }
    response = requests.get(url, headers=headers)
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


# def process_text_with_openai(report, max_tokens, chosen_model):
    # Edit this later!
    system_prompt="You are a Cyber Threat Intelligence Analyst and need to summarise a report for upper management. The report must be nicely formatted with three sections: one Executive Summary section and one 'TTPs and IoCs' section and one Mitigation Recommendation. The second section shall list all IP addresses (C2), domains, URLs, tools and hashes (sha-1, sha256, md5, etc.) which can be found in the report. If IoCs are not found, please do not create one, but if TTPs are found, list them all. Nicely format the report as markdown. Use newlines between markdown headings."
    # prompt += text
    text = f'{system_prompt}\n\n"""{report}"""'
    error_result = ""
    try:
        if chosen_model == "text-davinci-003":
            # fix this later, try catch
            result = openai.Completion.create(
                engine=chosen_model,
                prompt=text,
                temperature=0.3,
                max_tokens=max_tokens,
                top_p=0.2,
                frequency_penalty=0,
                presence_penalty=0,
                
            )
            if result.choices and result.choices[0].text is not None:
                return result.choices[0].text.strip()
            else:
                if 'choices' in result and result['choices'] and result['choices'][0]['message']['content'] is not None:
                    return result['choices'][0]['message']['content'].strip()
            # return result.choices[0].text.strip()
        else:
            # fix this later, try catch
            result = openai.ChatCompletion.create(
                model=chosen_model,
                messages=[{"role": "system", "content": f"{system_prompt}"},
                            {"role": "user", "content": f"{report}"},],
                temperature=0.3,
                max_tokens=max_tokens,
                top_p=0.2,
                frequency_penalty=0,
                presence_penalty=0
            )
            return result['choices'][0]['message']['content']
    except openai.error.OpenAIError as e:
        #Handle rate limit error, e.g. wait or log
        error_result = f"OpenAI API Error: {str(e)}"
        print(f"OpenAI API Error: {str(e)}")
        # pass
    return error_result

@app.get("/", response_class=HTMLResponse)
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/about", response_class=HTMLResponse)
def about(request: Request):
    return templates.TemplateResponse("about.html", {"request": request})

@app.post("/", response_class=HTMLResponse)
async def index(request: Request, data: str = Form(None), file_upload: UploadFile = File(None)):
    # openai.api_key = openAIKey
    # print("Model Chosen: " + model)

    # Handle PDF input
    if file_upload is not None:
        # Process file upload
        data = await file_upload.read()

        # read the pdf file
        pdf_data = pdfplumber.open(io.BytesIO(data))
        output = ""
        for page in pdf_data.pages:
            output += page.extract_text()

        # result = process_text_with_openai(output, word_count, model)
        # print("Print output: \n" + result)
        # result = markdown.markdown(result) 
        return output
    if data is not None:    
        # Process text/url input
        output = extract_text(data)
        # result = process_text_with_openai(output, word_count, model)
        # print("Print output: \n" + result)
        # result = markdown.markdown(result)
        return output
    else:
        # Handle case when no data is provided
        return "No input data provided"


# if __name__ == "__main__":
#     uvicorn.run('app:app', host="localhost", port=5001, reload=True)