pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                // We explicitly tell the robot to look at the 'main' branch
                git branch: 'main', url: 'https://github.com/RevanMidha/PhishGuard.git'
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
                docker run -d -p 5000:5000 --name phishguard-container -e MONGO_URI="mongodb://host.docker.internal:27017/phishguard" -e JWT_SECRET="kLdKkZNzxxW07sutPzePOdHII4EOK2JkIBi7pfYCL88=" phishguard
                '''
            }
        }
    }
}