pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/RevanMidha/PhishGuard.git'
            }
        }

        stage('Install Client') {
            steps {
                dir('client') {
                    bat 'npm install'
                }
            }
        }

        stage('Install Server') {
            steps {
                dir('server') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t phishguard .'
            }
        }

        stage('Stop Old Container') {
            steps {
                bat '''
                docker stop phishguard-container || exit 0
                docker rm phishguard-container || exit 0
                '''
            }
        }

        stage('Run Container') {
            steps {
                bat '''
                docker run -d -p 5000:5000 --name phishguard-container phishguard
                '''
            }
        }
    }
}