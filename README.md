# 🛡️ PhishGuard — ML-Powered Phishing Detection System

PhishGuard is a Machine Learning–based cybersecurity system designed to detect phishing attacks using URL analysis, Natural Language Processing (NLP), and Computer Vision techniques.

It helps identify malicious websites and protects users from credential theft and online fraud.

---

## 📌 Overview

Phishing attacks are among the most common cyber threats, exploiting users through fake websites and deceptive links. Traditional rule-based systems fail to detect modern phishing techniques.

PhishGuard uses Machine Learning models to analyze URLs, webpage content, and screenshots to accurately classify phishing attempts.

---

## 🎯 Objectives

* Detect phishing URLs using ML models
* Analyze webpage text using NLP
* Identify fake login pages via screenshots
* Provide real-time detection through APIs
* Build a scalable phishing detection framework

---

## 🏗️ System Architecture

Client → Server API → ML Engine → Detection Result

---

## 📂 Project Structure

```
PhishGuard/
│
├── client/            # Frontend interface
├── server/            # Backend API
├── ml_engine/         # ML detection modules
├── requirements.txt
├── .gitignore
└── README.md
```

---

## ⚙️ Technologies Used

**Programming & Backend**

* Python
* Flask / FastAPI

**Machine Learning**

* Scikit-learn
* TensorFlow / Keras
* OpenCV

**NLP**

* TF-IDF
* Text Classification

**Frontend**

* JavaScript
* HTML / CSS

---

## 🧠 Detection Modules

### 1️⃣ URL Detection

* URL length
* Special characters
* HTTPS presence
* Subdomain analysis

### 2️⃣ NLP Content Analysis

* Tokenization
* Stopword removal
* TF-IDF vectorization

### 3️⃣ Screenshot Detection

* Webpage capture
* CNN classification
* Layout similarity detection

---

## 🚀 How to Run

### 1️⃣ Clone the repository

```
git clone https://github.com/RevanMidha/PhishGuard.git
cd PhishGuard
```

### 2️⃣ Install dependencies

```
pip install -r requirements.txt
```

### 3️⃣ Start backend server

```
python server/app.py
```

Server runs at:

```
http://localhost:5000
```

---

## 📊 Features

* Real-time phishing detection
* URL classification
* Screenshot analysis
* NLP text detection
* API-based architecture

---

## 🔮 Future Enhancements

* Browser extension integration
* Email phishing detection
* Live traffic monitoring
* Cloud deployment

---

## 👨‍💻 Authors

- **Revan Midha**  
- **Utkarsh Singh**  
- **Simarpreet Singh**  
- **Dushyant Saini**  

Capstone Project — **PhishGuard**

---

## 📜 License

Developed for academic and research purposes.
