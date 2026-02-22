pipeline {
agent any

```
stages {

    stage('Install Node (Client)') {
        steps {
            dir('client') {
                bat 'npm install'
            }
        }
    }

    stage('Install Node (Server)') {
        steps {
            dir('server') {
                bat 'npm install'
            }
        }
    }

    stage('Install ML Dependencies') {
        steps {
            dir('ml_engine') {
                bat '"C:\\Users\\revan\\AppData\\Local\\Programs\\Python\\Python311\\python.exe" -m pip install -r requirements.txt'
            }
        }
    }

    stage('Run App') {
        steps {
            echo 'PhishGuard pipeline executed successfully 🚀'
        }
    }
}
```

}
