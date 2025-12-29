# Production Deployment Checklist

Complete checklist for deploying LoL Stonks RSS to production on Windows Server.

## Pre-Deployment

### System Requirements
- [ ] Windows Server 2019 or later installed
- [ ] 4GB RAM minimum (8GB recommended)
- [ ] 20GB free disk space
- [ ] Administrator access available
- [ ] Stable internet connection

### Software Installation
- [ ] Docker Desktop for Windows installed
- [ ] Docker version verified (`docker --version`)
- [ ] Docker Compose available (`docker-compose --version`)
- [ ] WSL 2 backend enabled (recommended)
- [ ] Docker service running

### Network Configuration
- [ ] Port 8000 available (not in use)
- [ ] Firewall rule created for port 8000
- [ ] Network connectivity tested
- [ ] DNS resolution working
- [ ] External access configured (if needed)

## Application Setup

### File Preparation
- [ ] Project files copied to deployment location
- [ ] All source files present (`src/`, `main.py`, etc.)
- [ ] `Dockerfile` present
- [ ] `docker-compose.yml` present
- [ ] `.dockerignore` present
- [ ] `requirements.txt` present

### Configuration
- [ ] `.env` file created from `.env.example`
- [ ] Database path configured (`DATABASE_PATH`)
- [ ] Server host set to `0.0.0.0`
- [ ] Server port configured (default: 8000)
- [ ] Base URL set correctly
- [ ] Log level set appropriately (`INFO` for production)
- [ ] Update interval configured
- [ ] Supported locales configured
- [ ] Cache TTL values set

### Data Directory
- [ ] `data/` directory created
- [ ] Proper permissions set on `data/` directory
- [ ] Write access verified
- [ ] Sufficient disk space available

## Build and Deploy

### Docker Build
- [ ] Docker image built successfully
- [ ] Build logs reviewed (no errors)
- [ ] Image size acceptable
- [ ] Image tagged correctly
- [ ] No sensitive data in image

### Container Start
- [ ] Container started with `docker-compose up -d`
- [ ] Container status is "running" (`docker ps`)
- [ ] No immediate crashes
- [ ] Restart policy configured (`unless-stopped`)
- [ ] Health check configured
- [ ] Resource limits set (if needed)

### Initial Verification
- [ ] Container logs show successful startup
- [ ] No error messages in logs
- [ ] Database created successfully
- [ ] API server started
- [ ] Scheduler started
- [ ] Initial news fetch completed

## Testing

### Health Checks
- [ ] Health endpoint responding (`/health`)
- [ ] Health status is "healthy"
- [ ] Database connection verified
- [ ] Scheduler status "running"
- [ ] Uptime counter working

### RSS Feeds
- [ ] Main feed accessible (`/feed.xml`)
- [ ] English feed accessible (`/feeds/en-us.xml`)
- [ ] Italian feed accessible (`/feeds/it-it.xml`)
- [ ] Feed contains articles
- [ ] Feed XML is valid
- [ ] Feed metadata correct (title, description)
- [ ] Article links working

### API Endpoints
- [ ] API documentation accessible (`/docs`)
- [ ] Health endpoint working (`/health`)
- [ ] Articles endpoint working (`/api/articles`)
- [ ] Scheduler status endpoint working (`/admin/scheduler/status`)
- [ ] Force update endpoint working (`/admin/update`)

### Functionality
- [ ] News fetching working
- [ ] Database writes successful
- [ ] RSS generation working
- [ ] Scheduled updates running
- [ ] Cache working correctly
- [ ] Multi-language support working

## Security

### Access Control
- [ ] Container runs as non-root user
- [ ] File permissions set correctly
- [ ] .env file secured (read-only)
- [ ] No sensitive data in logs
- [ ] Admin endpoints protected (if applicable)

### Network Security
- [ ] Firewall configured correctly
- [ ] Only necessary ports exposed
- [ ] SSL/TLS configured (if using reverse proxy)
- [ ] CORS configured (if needed)
- [ ] Rate limiting considered

### Data Security
- [ ] Database file permissions correct
- [ ] Backups configured
- [ ] Backup location secured
- [ ] Backup restoration tested
- [ ] Data retention policy defined

## Monitoring

### Logging
- [ ] Application logs accessible
- [ ] Log level appropriate for production
- [ ] Log rotation configured
- [ ] Log size limits set
- [ ] Logs monitored regularly

### Health Monitoring
- [ ] Health check endpoint monitored
- [ ] Container health status monitored
- [ ] Automated alerts configured (optional)
- [ ] Monitoring script set up (optional)
- [ ] Dashboard configured (optional)

### Performance Monitoring
- [ ] CPU usage monitored
- [ ] Memory usage monitored
- [ ] Disk usage monitored
- [ ] Network usage monitored
- [ ] Response times tracked

## Backup and Recovery

### Backup Strategy
- [ ] Backup script configured (`scripts/backup.ps1`)
- [ ] Backup schedule defined
- [ ] Backup location accessible
- [ ] Backup retention policy set
- [ ] Automated backups scheduled (optional)

### Backup Verification
- [ ] Backup script tested
- [ ] Backup contents verified
- [ ] Backup size acceptable
- [ ] Multiple backups created
- [ ] Old backups cleaned up

### Recovery Testing
- [ ] Recovery procedure documented
- [ ] Recovery tested at least once
- [ ] Database restore verified
- [ ] Configuration restore verified
- [ ] RTO/RPO objectives defined

## Documentation

### Deployment Documentation
- [ ] Deployment guide reviewed (`WINDOWS_DEPLOYMENT.md`)
- [ ] Docker guide reviewed (`DOCKER.md`)
- [ ] Configuration documented
- [ ] Custom changes documented
- [ ] Troubleshooting steps available

### Operational Documentation
- [ ] Maintenance procedures documented
- [ ] Update procedures documented
- [ ] Backup procedures documented
- [ ] Recovery procedures documented
- [ ] Contact information available

### User Documentation
- [ ] RSS feed URLs documented
- [ ] API endpoints documented
- [ ] Usage examples provided
- [ ] Known limitations documented

## Maintenance

### Update Strategy
- [ ] Update procedure defined
- [ ] Update schedule planned
- [ ] Rollback procedure documented
- [ ] Testing procedure defined
- [ ] Downtime window planned

### Regular Maintenance
- [ ] Log review schedule set
- [ ] Health check schedule set
- [ ] Backup verification schedule set
- [ ] Update check schedule set
- [ ] Security review schedule set

### Cleanup
- [ ] Old container cleanup planned
- [ ] Old image cleanup planned
- [ ] Old log cleanup planned
- [ ] Old backup cleanup planned
- [ ] Disk space monitoring configured

## Windows-Specific

### Docker Desktop
- [ ] Docker Desktop starts on boot
- [ ] WSL 2 backend configured
- [ ] Resource limits configured (CPU, memory)
- [ ] File sharing configured
- [ ] Hyper-V enabled (if not using WSL 2)

### Windows Services
- [ ] Docker service set to automatic start
- [ ] Container restart policy configured
- [ ] Windows Service integration (if using NSSM)
- [ ] Service dependencies configured
- [ ] Service recovery options set

### Windows Firewall
- [ ] Inbound rule created for port 8000
- [ ] Rule enabled and active
- [ ] Rule scope configured (all/specific IPs)
- [ ] Rule profile configured (Domain/Private/Public)
- [ ] Rule tested and verified

### Windows Updates
- [ ] Windows Update schedule configured
- [ ] Update impact on Docker considered
- [ ] Automatic restart settings configured
- [ ] Update testing procedure defined

## Performance

### Resource Allocation
- [ ] CPU limits set (if needed)
- [ ] Memory limits set (if needed)
- [ ] Disk I/O considered
- [ ] Network bandwidth considered

### Optimization
- [ ] Database indexes created (if needed)
- [ ] Cache settings optimized
- [ ] Update interval optimized
- [ ] Log level optimized
- [ ] Health check interval optimized

### Scaling
- [ ] Current load measured
- [ ] Growth projections made
- [ ] Scaling strategy defined
- [ ] Resource headroom available
- [ ] Bottlenecks identified

## Compliance and Legal

### Data Handling
- [ ] Data sources documented
- [ ] Data usage compliant with ToS
- [ ] Data retention policy defined
- [ ] Privacy considerations addressed
- [ ] GDPR compliance (if applicable)

### Licensing
- [ ] Software licenses reviewed
- [ ] Open source licenses compliant
- [ ] Attribution provided (if needed)
- [ ] Commercial use allowed

## Final Verification

### Pre-Launch
- [ ] All previous items completed
- [ ] Full system test performed
- [ ] Stakeholders notified
- [ ] Documentation complete
- [ ] Support plan in place

### Go-Live
- [ ] Service deployed to production
- [ ] All endpoints accessible
- [ ] No critical errors in logs
- [ ] Monitoring active
- [ ] Backups configured

### Post-Launch
- [ ] Service monitored for 24 hours
- [ ] No issues detected
- [ ] Performance acceptable
- [ ] Users notified (if applicable)
- [ ] Documentation updated with any changes

## Sign-Off

Date: _______________

Deployed by: _______________

Reviewed by: _______________

Approved by: _______________

## Notes

Add any deployment-specific notes, issues encountered, or deviations from standard procedure:

---

**Next Review Date:** _______________
