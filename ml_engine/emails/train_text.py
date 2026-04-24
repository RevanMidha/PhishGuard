import pandas as pd
import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.pipeline import Pipeline

# ── 1. Load ──────────────────────────────────────────────
df = pd.read_csv('../datasets/emails.csv').dropna()
print("Columns:", df.columns.tolist())
print("Label counts:\n", df['Email Type'].value_counts())

# ── 2. Prepare ────────────────────────────────────────────
df['label'] = (df['Email Type'] == 'Phishing Email').astype(int)
X = df['Email Text'].astype(str)
y = df['label']

print(f"\nTotal samples: {len(y)}")
print(f"Phishing: {y.sum()} | Safe: {(y==0).sum()}")

# ── 3. Split ──────────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

# ── 4. Build Pipeline (TF-IDF + Logistic Regression) ─────
pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(
        max_features=10000,
        stop_words='english',
        ngram_range=(1, 2),      # unigrams + bigrams
        sublinear_tf=True        # dampens high frequency words
    )),
    ('clf', LogisticRegression(
        max_iter=1000,
        class_weight='balanced',
        random_state=42
    ))
])

# ── 5. Train ──────────────────────────────────────────────
print("\nTraining...")
pipeline.fit(X_train, y_train)

# ── 6. Evaluate ───────────────────────────────────────────
y_prob = pipeline.predict_proba(X_test)[:, 1]
y_pred = (y_prob >= 0.4).astype(int)

print("\n── Classification Report (threshold=0.4) ──")
print(classification_report(y_test, y_pred, target_names=['Safe', 'Phishing']))

# ── 7. Save ───────────────────────────────────────────────
joblib.dump((pipeline, 0.4), 'text_model.pkl')
print("✅ Saved text_model.pkl with threshold=0.4")