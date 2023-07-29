# GPThreatIntel-Summarizer

GPThreatIntel-Summarizer is a Python-based repository that leverages the power of OpenAI's GPT (Generative Pre-trained Transformer) models to provide an automated summarization solution for Cyber Threat Intelligence (CTI) reports. This tool simplifies the process of extracting key insights from CTI reports, enabling cyber threat analysts to generate concise and informative summaries for upper management.

## Key Features

- Utilizes OpenAI GPT models ([text-davinci-003](https://platform.openai.com/docs/models/overview)) for natural language processing and summarization tasks.
- Extracts relevant text from CTI reports using [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) & [pypdf](https://pypi.org/project/pypdf/).
- Generates summarized reports based on user-defined length or word count.
- Extracts Indicators of Compromise (IOCs) and Tactics, Techniques, and Procedures (TTPs) from reports.
- Provides an intuitive web interface powered by [FastAPI](https://fastapi.tiangolo.com/) for easy interaction and display of results.

## Getting Started (Locally)

To get started with GPThreatIntel-Summarizer, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/GPThreatIntel-Summarizer.git
    ```

2. Install the required dependencies:
  
    ```bash
    pip install -r requirements.txt
    ```

3. Run the application:
   
    ```bash
    python app.py
    ```
    
4. Access the web interface in your browser at http://localhost:5001.

## Getting Started (Online)

1. Access the web interface in your browser at https://gp-threat-intel-summarizer.vercel.app/


## Usage
- Enter your OpenAI API Key, which can be found here
    - https://platform.openai.com/account/api-keys
- Enter the URL or paste the text content of the CTI report in the provided text field.
    - Alternatively, you can upload a PDF file.
- Specify the desired length or word count for the summary.
- Click the "Summarize" button to generate a summary of the report.
- The extracted IOCs and TTPs will be displayed below the summarized report.

## Demo


https://github.com/nitroz3us/GPThreatIntel-Summarizer/assets/109442833/e8327641-586b-488d-8a5a-95af125fc588


## Future Developments
- [ ] Parse IOC's from an image
- [x] Allow users to choose various GPT Models

## Why am I doing this?
- Wanted to try out OpenAI API & FastAPI

## Technologies Used
- OpenAI
- FastAPI
- TailwindCSS

## Limitations
- Since the OpenAI Model I am using is **text-davinci-003**, it has its [limitations](https://platform.openai.com/docs/models/gpt-3-5). The token limit (words) accepted are 4097 tokens.
    - Therefore, if the text content that users want to send to the model is larger than 4097 tokens (words), the model would not be able to process it.  

## Workarounds/Solutions to the limitations
1. Implement text embedding
2. Use a different OpenAI model, e.g. GPT3.5 Turbo, GPT4
    - More information can be found on OpenAI's documentation here
        - https://platform.openai.com/docs/models/overview 

## Contributing
Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License.

GPThreatIntel-Summarizer empowers cybersecurity professionals to efficiently analyze and communicate critical CTI findings, enhancing decision-making processes and improving organizational security.
