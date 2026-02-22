pipeline {
agent any

stages {

    stage('Install Node (Client)') {
        steps {
            dir('client') {
                bat 'npm install'
            }
        }
    }

    stage('Install Python (Server)') {
        steps {
            dir('server') {
                bat 'pip install -r requirements.txt'
            }
        }
    }

    stage('Run App') {
        steps {
            echo 'PhishGuard pipeline executed successfully 🚀'
        }
    }
}

}
