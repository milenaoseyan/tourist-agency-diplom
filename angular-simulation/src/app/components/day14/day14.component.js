/**
 * @fileoverview Компонент для 14-го дня практики - CI/CD и деплой
 * @module components/day14
 */

import NotificationCenterComponent from '../notification-center/notification-center.component.js';

class Day14Component {
  constructor() {
    this.title = 'День 14: CI/CD и Production Deployment';
    this.description = 'Docker, Kubernetes, GitHub Actions и мониторинг';
    
    this.deploymentStatus = {
      staging: 'pending',
      production: 'pending',
      lastDeploy: null,
      version: '1.0.0'
    };
    
    this.pipelineStages = [
      { name: 'Code Push', status: 'success', time: '2s' },
      { name: 'Lint & Test', status: 'success', time: '45s' },
      { name: 'Security Scan', status: 'success', time: '30s' },
      { name: 'Build Docker', status: 'success', time: '120s' },
      { name: 'Push Registry', status: 'success', time: '15s' },
      { name: 'Deploy Staging', status: 'pending', time: '60s' },
      { name: 'Smoke Tests', status: 'pending', time: '30s' },
      { name: 'Deploy Production', status: 'pending', time: '90s' }
    ];
  }

  render() {
    return `
      <div class="day14-container">
        <header class="day14-header">
          <h1>${this.title}</h1>
          <p class="subtitle">${this.description}</p>
          <div class="progress-indicator">
            <span class="progress-text">14/15 дней завершено</span>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 93%"></div>
            </div>
          </div>
        </header>

        <div class="deployment-dashboard">
          <div class="dashboard-header">
            <h2>📊 Deployment Dashboard</h2>
            <div class="version-info">
              <span class="version-tag">v${this.deploymentStatus.version}</span>
              <span class="environment-badge production">Production</span>
              <span class="environment-badge staging">Staging</span>
            </div>
          </div>

          <div class="dashboard-grid">
            <div class="dashboard-card pipeline">
              <h3>🔄 CI/CD Pipeline</h3>
              <div class="pipeline-visual">
                ${this.renderPipeline()}
              </div>
            </div>

            <div class="dashboard-card status">
              <h3>🌍 Environment Status</h3>
              <div class="environments">
                ${this.renderEnvironments()}
              </div>
            </div>

            <div class="dashboard-card metrics">
              <h3>📈 Deployment Metrics</h3>
              <div class="metrics-grid">
                <div class="metric">
                  <div class="metric-value">99.95%</div>
                  <div class="metric-label">Uptime</div>
                </div>
                <div class="metric">
                  <div class="metric-value">250ms</div>
                  <div class="metric-label">Avg Response</div>
                </div>
                <div class="metric">
                  <div class="metric-value">24</div>
                  <div class="metric-label">Deploys/month</div>
                </div>
                <div class="metric">
                  <div class="metric-value">15s</div>
                  <div class="metric-label">Rollback time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="infrastructure-section">
          <h2>🏗️ Infrastructure as Code</h2>
          
          <div class="infra-tabs">
            <button class="tab-btn active" data-tab="docker">Docker</button>
            <button class="tab-btn" data-tab="k8s">Kubernetes</button>
            <button class="tab-btn" data-tab="terraform">Terraform</button>
            <button class="tab-btn" data-tab="monitoring">Monitoring</button>
          </div>

          <div class="tab-content active" id="dockerTab">
            ${this.renderDockerConfig()}
          </div>
          
          <div class="tab-content" id="k8sTab">
            ${this.renderK8sConfig()}
          </div>
          
          <div class="tab-content" id="terraformTab">
            ${this.renderTerraformConfig()}
          </div>
          
          <div class="tab-content" id="monitoringTab">
            ${this.renderMonitoringConfig()}
          </div>
        </div>

        <div class="deployment-actions">
          <h3>🚀 Deployment Controls</h3>
          
          <div class="actions-grid">
            <button class="action-card" id="deployStaging">
              <span class="action-icon">🔄</span>
              <span class="action-title">Deploy to Staging</span>
              <span class="action-desc">Test environment</span>
            </button>
            
            <button class="action-card" id="deployProduction">
              <span class="action-icon">🚀</span>
              <span class="action-title">Deploy to Production</span>
              <span class="action-desc">Live environment</span>
            </button>
            
            <button class="action-card" id="rollback">
              <span class="action-icon">⏪</span>
              <span class="action-title">Rollback</span>
              <span class="action-desc">Previous version</span>
            </button>
            
            <button class="action-card" id="scale">
              <span class="action-icon">📊</span>
              <span class="action-title">Auto-scaling</span>
              <span class="action-desc">3 → 10 replicas</span>
            </button>
            
            <button class="action-card" id="backup">
              <span class="action-icon">💾</span>
              <span class="action-title">Backup Database</span>
              <span class="action-desc">Manual backup</span>
            </button>
            
            <button class="action-card" id="logs">
              <span class="action-icon">📋</span>
              <span class="action-title">View Logs</span>
              <span class="action-desc">Kibana dashboard</span>
            </button>
          </div>
        </div>

        <div class="monitoring-section">
          <h3>📡 Live Monitoring</h3>
          
          <div class="monitoring-panels">
            <div class="panel">
              <div class="panel-header">
                <span>System Health</span>
                <span class="status healthy">✅ Healthy</span>
              </div>
              <div class="panel-content">
                <div class="health-metrics">
                  <div class="health-item">
                    <span>API</span>
                    <span class="metric-bar" style="width: 100%">200ms</span>
                  </div>
                  <div class="health-item">
                    <span>Database</span>
                    <span class="metric-bar" style="width: 85%">45ms</span>
                  </div>
                  <div class="health-item">
                    <span>Redis</span>
                    <span class="metric-bar" style="width: 95%">5ms</span>
                  </div>
                  <div class="health-item">
                    <span>CDN</span>
                    <span class="metric-bar" style="width: 90%">120ms</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="panel">
              <div class="panel-header">
                <span>Recent Deployments</span>
              </div>
              <div class="panel-content">
                <div class="deployment-history">
                  <div class="history-item">
                    <span class="time">2 min ago</span>
                    <span class="event">v1.0.3 deployed to staging</span>
                    <span class="status success">✅</span>
                  </div>
                  <div class="history-item">
                    <span class="time">1 hour ago</span>
                    <span class="event">v1.0.2 deployed to production</span>
                    <span class="status success">✅</span>
                  </div>
                  <div class="history-item">
                    <span class="time">3 hours ago</span>
                    <span class="event">Auto-scaling triggered</span>
                    <span class="status info">🔄</span>
                  </div>
                  <div class="history-item">
                    <span class="time">5 hours ago</span>
                    <span class="event">Database backup completed</span>
                    <span class="status success">✅</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="panel">
              <div class="panel-header">
                <span>Active Alerts</span>
                <span class="badge">2</span>
              </div>
              <div class="panel-content">
                <div class="alerts-list">
                  <div class="alert-item warning">
                    <span class="alert-icon">⚠️</span>
                    <span class="alert-message">CPU > 70% for 5m</span>
                    <span class="alert-time">2m ago</span>
                  </div>
                  <div class="alert-item info">
                    <span class="alert-icon">ℹ️</span>
                    <span class="alert-message">New version available</span>
                    <span class="alert-time">15m ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="documentation-links">
          <h3>📚 DevOps Documentation</h3>
          
          <div class="links-grid">
            <a href="#" class="doc-link">
              <span class="doc-icon">🐳</span>
              <span class="doc-title">Docker Guide</span>
              <span class="doc-desc">Container best practices</span>
            </a>
            
            <a href="#" class="doc-link">
              <span class="doc-icon">☸️</span>
              <span class="doc-title">Kubernetes</span>
              <span class="doc-desc">Production configuration</span>
            </a>
            
            <a href="#" class="doc-link">
              <span class="doc-icon">🏗️</span>
              <span class="doc-title">Terraform</span>
              <span class="doc-desc">AWS infrastructure</span>
            </a>
            
            <a href="#" class="doc-link">
              <span class="doc-icon">🤖</span>
              <span class="doc-title">GitHub Actions</span>
              <span class="doc-desc">CI/CD pipeline</span>
            </a>
            
            <a href="#" class="doc-link">
              <span class="doc-icon">📊</span>
              <span class="doc-title">Prometheus</span>
              <span class="doc-desc">Metrics & alerts</span>
            </a>
            
            <a href="#" class="doc-link">
              <span class="doc-icon">📈</span>
              <span class="doc-title">Grafana</span>
              <span class="doc-desc">Dashboards</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderPipeline() {
    return `
      <div class="pipeline-stages">
        ${this.pipelineStages.map((stage, index) => `
          <div class="stage">
            <div class="stage-indicator ${stage.status}"></div>
            <div class="stage-content">
              <div class="stage-name">${stage.name}</div>
              <div class="stage-time">${stage.time}</div>
              <div class="stage-status">${this.getStatusIcon(stage.status)}</div>
            </div>
            ${index < this.pipelineStages.length - 1 ? '<div class="stage-connector"></div>' : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderEnvironments() {
    return `
      <div class="environment">
        <div class="env-header">
          <span class="env-name">Staging</span>
          <span class="env-url">staging.travelwave.com</span>
          <span class="env-status active">🟢 Active</span>
        </div>
        <div class="env-details">
          <div class="detail">
            <span>Version:</span>
            <span class="version">v1.0.3-rc.2</span>
          </div>
          <div class="detail">
            <span>Deployed:</span>
            <span>2 minutes ago</span>
          </div>
          <div class="detail">
            <span>Health:</span>
            <span class="health-check">✅ 100%</span>
          </div>
          <div class="detail">
            <span>Pods:</span>
            <span>3/3 running</span>
          </div>
        </div>
      </div>
      
      <div class="environment">
        <div class="env-header">
          <span class="env-name">Production</span>
          <span class="env-url">travelwave.com</span>
          <span class="env-status active">🟢 Active</span>
        </div>
        <div class="env-details">
          <div class="detail">
            <span>Version:</span>
            <span class="version">v1.0.2</span>
          </div>
          <div class="detail">
            <span>Deployed:</span>
            <span>1 hour ago</span>
          </div>
          <div class="detail">
            <span>Health:</span>
            <span class="health-check">✅ 99.95%</span>
          </div>
          <div class="detail">
            <span>Pods:</span>
            <span>5/5 running</span>
          </div>
        </div>
      </div>
    `;
  }

  renderDockerConfig() {
    return `
      <div class="config-viewer">
        <div class="config-header">
          <h4>Multi-stage Dockerfile</h4>
          <button class="btn-icon copy-config" data-config="docker">📋</button>
        </div>
        <pre><code>FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER nodejs
EXPOSE 5000
CMD ["node", "server.js"]</code></pre>
        
        <div class="docker-services">
          <h4>Docker Compose Services</h4>
          <div class="service-list">
            <div class="service">
              <span class="service-name">mongodb</span>
              <span class="service-version">6.0</span>
              <span class="service-port">27017</span>
            </div>
            <div class="service">
              <span class="service-name">redis</span>
              <span class="service-version">7-alpine</span>
              <span class="service-port">6379</span>
            </div>
            <div class="service">
              <span class="service-name">backend</span>
              <span class="service-version">node:18</span>
              <span class="service-port">5000</span>
            </div>
            <div class="service">
              <span class="service-name">frontend</span>
              <span class="service-version">nginx:alpine</span>
              <span class="service-port">80</span>
            </div>
            <div class="service">
              <span class="service-name">prometheus</span>
              <span class="service-version">latest</span>
              <span class="service-port">9090</span>
            </div>
            <div class="service">
              <span class="service-name">grafana</span>
              <span class="service-version">latest</span>
              <span class="service-port">3000</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderK8sConfig() {
    return `
      <div class="config-viewer">
        <div class="config-header">
          <h4>Kubernetes Deployment</h4>
          <button class="btn-icon copy-config" data-config="k8s">📋</button>
        </div>
        <pre><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: travelwave-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: travelwave
  template:
    metadata:
      labels:
        app: travelwave
    spec:
      containers:
      - name: backend
        image: ghcr.io/travelwave/backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"</code></pre>
        
        <div class="k8s-resources">
          <h4>Cluster Resources</h4>
          <div class="resource-stats">
            <div class="stat">
              <span>Nodes</span>
              <span class="value">3</span>
            </div>
            <div class="stat">
              <span>Pods</span>
              <span class="value">12</span>
            </div>
            <div class="stat">
              <span>Services</span>
              <span class="value">5</span>
            </div>
            <div class="stat">
              <span>Ingress</span>
              <span class="value">2</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderTerraformConfig() {
    return `
      <div class="config-viewer">
        <div class="config-header">
          <h4>Terraform AWS Configuration</h4>
          <button class="btn-icon copy-config" data-config="terraform">📋</button>
        </div>
        <pre><code>resource "aws_eks_cluster" "main" {
  name     = "travelwave-production"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.27"
  
  vpc_config {
    subnet_ids = aws_subnet.private[*].id
  }
}

resource "aws_db_instance" "main" {
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.small"
  db_name        = "travelwave"
}</code></pre>
        
        <div class="aws-resources">
          <h4>Provisioned Resources</h4>
          <div class="resource-list">
            <div class="resource-item">
              <span class="resource-type">EKS</span>
              <span class="resource-name">travelwave-production</span>
            </div>
            <div class="resource-item">
              <span class="resource-type">RDS</span>
              <span class="resource-name">postgres-15</span>
            </div>
            <div class="resource-item">
              <span class="resource-type">ElastiCache</span>
              <span class="resource-name">redis-7</span>
            </div>
            <div class="resource-item">
              <span class="resource-type">S3</span>
              <span class="resource-name">static-assets</span>
            </div>
            <div class="resource-item">
              <span class="resource-type">CloudFront</span>
              <span class="resource-name">cdn</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderMonitoringConfig() {
    return `
      <div class="config-viewer">
        <div class="config-header">
          <h4>Prometheus Alerts</h4>
          <button class="btn-icon copy-config" data-config="monitoring">📋</button>
        </div>
        <pre><code>groups:
- name: travelwave_alerts
  rules:
  - alert: BackendDown
    expr: up{job="backend"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Backend is down"</code></pre>
        
        <div class="monitoring-stack">
          <h4>Monitoring Stack</h4>
          <div class="stack-items">
            <div class="stack-item">
              <span class="stack-icon">📊</span>
              <span class="stack-name">Prometheus</span>
              <span class="stack-status">✅ Running</span>
            </div>
            <div class="stack-item">
              <span class="stack-icon">📈</span>
              <span class="stack-name">Grafana</span>
              <span class="stack-status">✅ Running</span>
            </div>
            <div class="stack-item">
              <span class="stack-icon">🔍</span>
              <span class="stack-name">Elasticsearch</span>
              <span class="stack-status">✅ Running</span>
            </div>
            <div class="stack-item">
              <span class="stack-icon">📋</span>
              <span class="stack-name">Kibana</span>
              <span class="stack-status">✅ Running</span>
            </div>
          </div>
        </div>
        
        <div class="grafana-dashboards">
          <h4>Grafana Dashboards</h4>
          <div class="dashboard-list">
            <div class="dashboard">
              <span>📊 Node Exporter Full</span>
              <span class="dashboard-id">ID: 1860</span>
            </div>
            <div class="dashboard">
              <span>📈 MongoDB Overview</span>
              <span class="dashboard-id">ID: 2583</span>
            </div>
            <div class="dashboard">
              <span>📉 Redis Dashboard</span>
              <span class="dashboard-id">ID: 763</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  afterRender() {
    this.initTabHandlers();
    this.initCopyButtons();
    this.initDeploymentActions();
    this.startMetricsSimulation();
  }

  initTabHandlers() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        e.target.classList.add('active');
        
        // Show corresponding content
        const tabId = e.target.dataset.tab;
        document.getElementById(`${tabId}Tab`).classList.add('active');
      });
    });
  }

  initCopyButtons() {
    document.querySelectorAll('.copy-config').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const configType = e.target.closest('.copy-config').dataset.config;
        let configText = '';
        
        switch(configType) {
          case 'docker':
            configText = this.getDockerConfig();
            break;
          case 'k8s':
            configText = this.getK8sConfig();
            break;
          case 'terraform':
            configText = this.getTerraformConfig();
            break;
          case 'monitoring':
            configText = this.getMonitoringConfig();
            break;
        }
        
        navigator.clipboard.writeText(configText);
        NotificationCenterComponent.success('Конфигурация скопирована!');
      });
    });
  }

  initDeploymentActions() {
    document.getElementById('deployStaging')?.addEventListener('click', () => {
      this.simulateDeployment('staging');
    });

    document.getElementById('deployProduction')?.addEventListener('click', () => {
      this.simulateDeployment('production');
    });

    document.getElementById('rollback')?.addEventListener('click', () => {
      this.simulateRollback();
    });

    document.getElementById('scale')?.addEventListener('click', () => {
      this.simulateScaling();
    });

    document.getElementById('backup')?.addEventListener('click', () => {
      this.simulateBackup();
    });

    document.getElementById('logs')?.addEventListener('click', () => {
      this.showLogs();
    });
  }

  simulateDeployment(environment) {
    NotificationCenterComponent.info(`🚀 Starting deployment to ${environment}...`);
    
    let progress = 0;
    const stages = ['Build', 'Test', 'Push', 'Deploy', 'Health Check'];
    
    const interval = setInterval(() => {
      if (progress < stages.length) {
        NotificationCenterComponent.info(`📦 ${stages[progress]}...`);
        progress++;
      } else {
        clearInterval(interval);
        NotificationCenterComponent.success(`✅ Deployment to ${environment} completed!`);
        
        // Update pipeline status
        if (environment === 'staging') {
          this.pipelineStages[5].status = 'success';
          this.pipelineStages[6].status = 'success';
        }
        
        this.updatePipelineDisplay();
      }
    }, 1000);
  }

  simulateRollback() {
    NotificationCenterComponent.warning('⏪ Rolling back to previous version...');
    
    setTimeout(() => {
      NotificationCenterComponent.success('✅ Rollback completed! Version v1.0.1 is now active');
    }, 2000);
  }

  simulateScaling() {
    NotificationCenterComponent.info('📊 Scaling replicas from 3 to 10...');
    
    setTimeout(() => {
      NotificationCenterComponent.success('✅ Auto-scaling completed! 10 replicas running');
    }, 1500);
  }

  simulateBackup() {
    NotificationCenterComponent.info('💾 Creating database backup...');
    
    setTimeout(() => {
      NotificationCenterComponent.success('✅ Backup completed! Size: 2.3 GB');
    }, 2000);
  }

  showLogs() {
    const logs = `
[2024-01-15 10:23:45] INFO: Application started on port 5000
[2024-01-15 10:23:46] INFO: Connected to MongoDB
[2024-01-15 10:23:47] INFO: Connected to Redis
[2024-01-15 10:23:48] INFO: Loaded 24 tours from database
[2024-01-15 10:24:01] INFO: New user registered: user@example.com
[2024-01-15 10:24:15] INFO: Booking created: #12345
[2024-01-15 10:25:30] INFO: Payment processed successfully: #ORD-67890
    `;
    
    const modal = document.createElement('div');
    modal.className = 'logs-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>📋 System Logs</h3>
          <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
          <pre><code>${logs}</code></pre>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary close-modal">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelectorAll('.close-modal').forEach(btn => {
      btn.addEventListener('click', () => modal.remove());
    });
  }

  updatePipelineDisplay() {
    const pipelineContainer = document.querySelector('.pipeline-visual');
    if (pipelineContainer) {
      pipelineContainer.innerHTML = this.renderPipeline();
    }
  }

  getStatusIcon(status) {
    const icons = {
      'success': '✅',
      'pending': '⏳',
      'failed': '❌'
    };
    return icons[status] || '⏳';
  }

  getDockerConfig() {
    return `FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER nodejs
EXPOSE 5000
CMD ["node", "server.js"]`;
  }

  getK8sConfig() {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: travelwave-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: travelwave
  template:
    metadata:
      labels:
        app: travelwave
    spec:
      containers:
      - name: backend
        image: ghcr.io/travelwave/backend:latest
        ports:
        - containerPort: 5000`;
  }

  getTerraformConfig() {
    return `resource "aws_eks_cluster" "main" {
  name     = "travelwave-production"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.27"
}`;
  }

  getMonitoringConfig() {
    return `groups:
- name: travelwave_alerts
  rules:
  - alert: BackendDown
    expr: up{job="backend"} == 0
    for: 1m
    labels:
      severity: critical`;
  }

  startMetricsSimulation() {
    // Simulate real-time metrics updates
    setInterval(() => {
      const metrics = document.querySelectorAll('.metric-value');
      if (metrics.length > 0) {
        const uptime = (99.95 + Math.random() * 0.04).toFixed(2);
        const response = (200 + Math.floor(Math.random() * 100)) + 'ms';
        
        metrics[0].textContent = uptime + '%';
        metrics[1].textContent = response;
      }
    }, 5000);
  }

  static init(containerSelector) {
    const day14 = new Day14Component();
    const container = document.querySelector(containerSelector);
    
    if (container) {
      container.innerHTML = day14.render();
      day14.afterRender();
    }
    
    return day14;
  }
}

export default Day14Component;