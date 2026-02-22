pipeline {
agent any

```
stages {

    stage('Clone Repo') {
        steps {
            git 'https://github.com/RevanMidha/PhishGuard.git'
        }
    }

    stage('Install Node') {
        steps {
            sh 'npm install'
        }
    }

    stage('Install Python') {
        steps {
            sh 'pip install -r requirements.txt'
        }
    }

    stage('Run App') {
        steps {
            echo 'PhishGuard running successfully 🚀'
        }
    }
}
```

}
