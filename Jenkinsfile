pipeline {
    agent any

    environment {
        IMAGE_NAME = "sortingvisualizer_image"
        CONTAINER_NAME = "sortingvisualizer_container"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/yassinekamouss/SortingVisualize.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh "docker build -t $IMAGE_NAME ."
                }
            }
        }

        stage('Run Docker Container') {
            steps {
                script {
                    // Supprimer le container s'il existe déjà
                    sh "docker rm -f $CONTAINER_NAME || true"
                    // Lancer le container
                    sh "docker run -d -p 80:80 --name $CONTAINER_NAME $IMAGE_NAME"
                }
            }
        }
    }

    post {
        success {
            echo "✅ App buildée et lancée sur http://localhost"
        }
        failure {
            echo "❌ Le pipeline a échoué, check les logs !"
        }
    }
}
