pipeline {
agent any

```
options {
    timestamps()
    disableConcurrentBuilds()
}

environment {
    CI = 'true'
}

stages {

    stage('Checkout') {
        steps {
            checkout scm
        }
    }

    stage('Verify Tools') {
        steps {
            bat 'git --version'
            bat 'node --version'
            bat 'npm --version'
            bat 'docker --version'
            bat 'docker compose version'
        }
    }

    stage('Install Frontend Dependencies') {
        steps {
            dir('Frontend') {
                bat 'npm ci'
            }
        }
    }

    stage('Install Backend Dependencies') {
        steps {
            dir('backend') {
                bat 'npm ci'
            }
        }
    }

    stage('Lint Frontend') {
        steps {
            dir('Frontend') {
                bat 'npm run lint --if-present'
            }
        }
    }

    stage('Build Frontend') {
        steps {
            dir('Frontend') {
                bat 'npm run build'
            }
        }
    }

    stage('Lint Backend') {
        steps {
            dir('backend') {
                bat 'npm run lint --if-present'
            }
        }
    }

    stage('Test Backend') {
        steps {
            dir('backend') {
                bat 'npm test --if-present'
            }
        }
    }

    stage('Validate Docker Compose') {
        steps {
            bat 'docker compose config'
        }
    }

    stage('Build Docker Images') {
        steps {
            bat 'docker compose build'
        }
    }

    stage('Show Images') {
        steps {
            bat 'docker images'
        }
    }
}

post {
    success {
        echo 'Build completed successfully'
    }

    failure {
        echo 'Build failed'
    }

    always {
        archiveArtifacts artifacts: 'Frontend/dist/**', allowEmptyArchive: true
    }
}
```

}
