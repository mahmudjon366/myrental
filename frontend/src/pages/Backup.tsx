import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Form,
  ProgressBar,
  Badge,
} from 'react-bootstrap';
import { backupService } from '../services/backupService';
import { BackupInfo, BackupData } from '../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const Backup: React.FC = () => {
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [clearExisting, setClearExisting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBackupInfo();
  }, []);

  const fetchBackupInfo = async () => {
    try {
      const data = await backupService.getBackupInfo();
      setBackupInfo(data);
    } catch (error) {
      console.error('Failed to fetch backup info:', error);
    }
  };

  const handleExportBackup = async () => {
    try {
      setLoading(true);
      const blob = await backupService.exportData();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rental_backup_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Backup exported successfully!');
    } catch (error) {
      toast.error('Failed to export backup');
      console.error('Export error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
      } else {
        toast.error('Please select a valid JSON backup file');
        event.target.value = '';
      }
    }
  };

  const handleImportBackup = async () => {
    if (!selectedFile) {
      toast.error('Please select a backup file');
      return;
    }

    try {
      setImporting(true);
      setImportProgress(10);

      // Read file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsText(selectedFile);
      });

      setImportProgress(30);

      // Parse JSON
      let backupData: BackupData;
      try {
        backupData = JSON.parse(fileContent);
      } catch (parseError) {
        throw new Error('Invalid JSON format');
      }

      setImportProgress(50);

      // Validate backup data structure
      if (!backupData.data || !backupData.data.products || !backupData.data.customers || !backupData.data.rentals) {
        throw new Error('Invalid backup file structure');
      }

      setImportProgress(70);

      // Import data
      const result = await backupService.importData(backupData, clearExisting);
      
      setImportProgress(100);

      // Show results
      toast.success('Backup imported successfully!');
      
      // Display import results
      const message = `
        Products: ${result.result.products.imported} imported, ${result.result.products.skipped} skipped, ${result.result.products.errors} errors
        Customers: ${result.result.customers.imported} imported, ${result.result.customers.skipped} skipped, ${result.result.customers.errors} errors
        Rentals: ${result.result.rentals.imported} imported, ${result.result.rentals.skipped} skipped, ${result.result.rentals.errors} errors
      `;
      
      console.log('Import results:', message);
      
      // Reset form
      setSelectedFile(null);
      setClearExisting(false);
      const fileInput = document.getElementById('backup-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      // Refresh backup info
      fetchBackupInfo();
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to import backup');
      console.error('Import error:', error);
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1>Backup & Restore</h1>
          <p className="text-muted">
            Export your data for backup or import data from a previous backup.
          </p>
        </Col>
      </Row>

      {/* Current Data Overview */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-database me-2"></i>
                Current Data Overview
              </h5>
            </Card.Header>
            <Card.Body>
              {backupInfo ? (
                <div>
                  <Row className="text-center mb-3">
                    <Col>
                      <h4 className="text-primary">{backupInfo.totalRecords}</h4>
                      <small className="text-muted">Total Records</small>
                    </Col>
                  </Row>
                  <Row className="text-center">
                    <Col>
                      <Badge bg="info" className="me-2">
                        Products: {backupInfo.breakdown.products}
                      </Badge>
                      <Badge bg="success" className="me-2">
                        Customers: {backupInfo.breakdown.customers}
                      </Badge>
                      <Badge bg="warning">
                        Rentals: {backupInfo.breakdown.rentals}
                      </Badge>
                    </Col>
                  </Row>
                </div>
              ) : (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-download me-2"></i>
                Export Data
              </h5>
            </Card.Header>
            <Card.Body>
              <p className="text-muted">
                Create a backup of all your data including products, customers, and rentals.
              </p>
              <Button
                variant="primary"
                onClick={handleExportBackup}
                disabled={loading}
                className="w-100"
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download me-2"></i>
                    Download Backup
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Import Data */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-upload me-2"></i>
                Import Data
              </h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="warning">
                <i className="fas fa-exclamation-triangle me-2"></i>
                <strong>Warning:</strong> Importing data will modify your current database. 
                Make sure to create a backup before proceeding.
              </Alert>

              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Select Backup File</Form.Label>
                  <Form.Control
                    type="file"
                    id="backup-file"
                    accept=".json"
                    onChange={handleFileSelect}
                    disabled={importing}
                  />
                  <Form.Text className="text-muted">
                    Select a JSON backup file exported from this system.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="clear-existing"
                    label="Clear existing data before import"
                    checked={clearExisting}
                    onChange={(e) => setClearExisting(e.target.checked)}
                    disabled={importing}
                  />
                  <Form.Text className="text-muted">
                    If checked, all existing data will be deleted before importing. 
                    Otherwise, data will be merged (existing records with same ID will be skipped).
                  </Form.Text>
                </Form.Group>

                {importing && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span>Import Progress</span>
                      <span>{importProgress}%</span>
                    </div>
                    <ProgressBar now={importProgress} animated />
                  </div>
                )}

                <div className="d-flex gap-2">
                  <Button
                    variant="success"
                    onClick={handleImportBackup}
                    disabled={!selectedFile || importing}
                  >
                    {importing ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload me-2"></i>
                        Import Backup
                      </>
                    )}
                  </Button>
                  
                  {selectedFile && !importing && (
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setSelectedFile(null);
                        const fileInput = document.getElementById('backup-file') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>

                {selectedFile && (
                  <Alert variant="info" className="mt-3">
                    <strong>Selected file:</strong> {selectedFile.name} 
                    ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </Alert>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Best Practices */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-lightbulb me-2"></i>
                Backup Best Practices
              </h5>
            </Card.Header>
            <Card.Body>
              <ul className="mb-0">
                <li>Create regular backups of your data, especially before major changes</li>
                <li>Store backup files in a secure location outside of this application</li>
                <li>Test your backups periodically by importing them in a test environment</li>
                <li>Keep multiple backup versions from different time periods</li>
                <li>Always backup before importing data from another source</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Backup;