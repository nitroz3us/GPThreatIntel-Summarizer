# GPThreatIntel-Summarizer

GPThreatIntel-Summarizer is a Python-based repository that leverages the power of OpenAI's GPT (Generative Pre-trained Transformer) models and Cyber Threat Intelligence (CTI) to provide an automated summarization solution for threat intelligence reports. This tool simplifies the process of extracting key insights from CTI reports, enabling cyber threat analysts to generate concise and informative summaries for upper management.

## Key Features

- Utilizes OpenAI GPT models ([text-davinci-003](https://platform.openai.com/docs/models/overview)) for natural language processing and summarization tasks.
- Extracts relevant text from CTI reports using [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/).
- Generates summarized reports based on user-defined length or word count.
- Extracts Indicators of Compromise (IOCs) and Tactics, Techniques, and Procedures (TTPs) from reports.
- Provides an intuitive web interface powered by [FastAPI](https://fastapi.tiangolo.com/) for easy interaction and display of results.

## Getting Started

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

## Usage
- Enter the URL or the text content of the CTI report in the provided text field.
- Specify the desired length or word count for the summary.
- Click the "Summarize" button to generate a summary of the report.
- The extracted IOCs and TTPs will be displayed below the summarized report.

## Demo (unfinished)

<img src="https://github.com/nitroz3us/GPThreatIntel-Summarizer/blob/main/src/images/demo.jpg" width="100%" /> 

## Ongoing Developments
- [ ] Integrating OpenAI model into the system

## Future Developments
- [ ] Parse PDFs
- [ ] Parse IOC's from an image
- [ ] Generate a report based on the IOC's given

## Why am I doing this?
- Wanted to try out OpenAI API & FastAPI

## Technologies Used
- OpenAI
- FastAPI
- TailwindCSS

## Contributing
Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.

## License
This project is licensed under the MIT License.

GPThreatIntel-Summarizer empowers cybersecurity professionals to efficiently analyze and communicate critical CTI findings, enhancing decision-making processes and improving organizational security.
