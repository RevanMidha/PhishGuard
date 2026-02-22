\# 🛡️ PhishGuard — ML-Powered Phishing Detection System



PhishGuard is a Machine Learning–driven cybersecurity system designed to detect phishing attacks using URL analysis, Natural Language Processing (NLP), and Computer Vision techniques. The system analyzes suspicious links, webpage content, and visual cues to identify malicious intent and protect users from credential theft and online fraud.



---



\# 📌 Project Overview



Phishing remains one of the most prevalent cyber threats, targeting individuals and organizations through deceptive URLs, fake login pages, and social engineering techniques. Traditional rule-based detection systems struggle to identify modern, sophisticated phishing attacks.



PhishGuard addresses this problem by leveraging Machine Learning and Deep Learning models to detect phishing attempts with high accuracy through multi-layered analysis.



---



\# 🎯 Objectives



\* Detect phishing URLs using ML classification models

\* Analyze webpage textual content using NLP techniques

\* Classify phishing webpages using screenshot analysis

\* Provide real-time detection via backend APIs

\* Build a scalable self-hosted phishing detection framework



---



\# 🏗️ System Architecture



```

Client (Frontend)

&nbsp;       ↓

Server API (Backend)

&nbsp;       ↓

ML Engine (Detection Models)

&nbsp;       ↓

Phishing / Legitimate Result

```



\### Flow Explanation



1\. User submits a URL or webpage.

2\. Backend extracts features (URL, HTML, screenshots).

3\. ML models analyze inputs.

4\. Detection result returned to client.



---



\# 📂 Project Structure



```

PhishGuard/

│

├── client/                # Frontend interface

│

├── server/                # Backend API services

│   ├── routes/

│   ├── controllers/

│   └── app.py

│

├── ml\_engine/             # ML models \& inference logic

│   ├── url\_model/

│   ├── nlp\_model/

│   ├── vision\_model/

│   └── inference.py

│

├── datasets/              # Training datasets (optional / small only)

│

├── requirements.txt       # Python dependencies

│

├── .gitignore

│

└── README.md

```



---



\# ⚙️ Technologies Used



\### Programming \& Frameworks



\* Python

\* Flask / FastAPI

\* JavaScript



\### Machine Learning



\* Scikit-learn

\* TensorFlow / Keras

\* OpenCV



\### NLP



\* TF-IDF Vectorization

\* URL Tokenization

\* Text Classification



\### Tools \& Platforms



\* Git \& GitHub

\* VS Code

\* Jupyter Notebook / Colab



---



\# 🧠 Machine Learning Modules



\## 1️⃣ URL-Based Detection



Features extracted:



\* URL length

\* Special characters

\* Subdomain count

\* HTTPS usage

\* Suspicious keywords



Models used:



\* Logistic Regression

\* Random Forest

\* SVM (optional)



---



\## 2️⃣ NLP Content Analysis



Analyzes webpage text for phishing intent.



Techniques:



\* Tokenization

\* Stopword removal

\* TF-IDF vectorization

\* Classification models



---



\## 3️⃣ Screenshot / Vision Detection



Detects fake login pages visually.



Methods:



\* Webpage screenshot capture

\* CNN classification

\* Logo / layout similarity detection



---



\# 🚀 How to Run the Project



\## 1️⃣ Clone Repository



```bash

git clone https://github.com/RevanMidha/PhishGuard.git

cd PhishGuard

```



---



\## 2️⃣ Install Dependencies



```bash

pip install -r requirements.txt

```



---



\## 3️⃣ Start Backend Server



```bash

python server/app.py

```



Server will run on:



```

http://localhost:5000

```



---



\## 4️⃣ Launch Frontend



Open the client folder and run frontend server or open index file in browser.



---



\# 📊 Features



\* Real-time phishing URL detection

\* Webpage content classification

\* Screenshot-based phishing detection

\* API-driven architecture

\* Modular ML pipeline

\* Self-hosted deployment ready



---



\# 📈 Evaluation Metrics



Models evaluated using:



\* Accuracy

\* Precision

\* Recall

\* F1-Score

\* Confusion Matrix



\*(Update with your actual results if needed)\*



---



\# 🔮 Future Enhancements



\* Browser extension integration

\* Email phishing detection

\* Live traffic monitoring

\* DDoS + phishing unified defense

\* Cloud deployment (AWS / Azure)

\* BERT-based NLP detection



---



\# 🛡️ Security Use Cases



\* Enterprise email filtering

\* Banking fraud prevention

\* Secure login page verification

\* SOC threat intelligence support



---



\# 👨‍💻 Author



\*\*Revan Midha\*\*

Capstone Project — PhishGuard

Cybersecurity \& Machine Learning



---



\# 📜 License



This project is developed for academic and research purposes.



---



\# 🙌 Acknowledgements



\* Open-source phishing datasets

\* Scikit-learn \& TensorFlow communities

\* Academic research on phishing detection



---



