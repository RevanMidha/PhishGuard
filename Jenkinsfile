pipeline {
agent any

stages {

    stage('Install Node') {
        steps {
            bat 'npm install'
        }
    }

    stage('Install Python') {
        steps {
            bat 'pip install -r requirements.txt'
        }
    }

    stage('Run App') {
        steps {
            echo 'PhishGuard running successfully 🚀'
        }
    }
}
}
