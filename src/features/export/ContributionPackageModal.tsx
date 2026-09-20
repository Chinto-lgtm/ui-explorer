import React, { useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Download, GitPullRequest, X, FileCode } from 'lucide-react';
import './ContributionPackageModal.css';

export const ContributionPackageModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentStyle } = useStyle();
  const [authorName, setAuthorName] = useState('github_username');
  const [license, setLicense] = useState('MIT');
  const [repoUrl, setRepoUrl] = useState('https://github.com/username/ui-explorer');

  const metadataJson = JSON.stringify(
    {
      id: currentStyle.metadata.id,
      name: currentStyle.metadata.name,
      author: authorName,
      version: '1.0.0',
      category: currentStyle.metadata.category,
      description: currentStyle.metadata.description,
      tags: currentStyle.metadata.tags,
      license,
      repository: repoUrl
    },
    null,
    2
  );

  const styleJson = JSON.stringify(currentStyle, null, 2);

  const readmeContent = `# ${currentStyle.metadata.name}

Contributed to UI Explorer by **${authorName}**.

## Metadata
- **Category**: ${currentStyle.metadata.category}
- **License**: ${license}
- **Repository**: ${repoUrl}

## Description
${currentStyle.metadata.description}
`;

  const handleDownloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    handleDownloadFile(styleJson, `${currentStyle.metadata.id}-style.json`);
    handleDownloadFile(metadataJson, `${currentStyle.metadata.id}-metadata.json`);
    handleDownloadFile(readmeContent, `${currentStyle.metadata.id}-README.md`);
  };

  return (
    <div className="contrib-modal-backdrop">
      <div className="contrib-modal">
        <div className="contrib-modal-header">
          <div className="contrib-title">
            <GitPullRequest size={20} />
            <h2>Export Contribution Package</h2>
          </div>
          <button className="contrib-close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="contrib-modal-body">
          <div className="contrib-form-col">
            <h3>Contributor Identity & Metadata</h3>
            <Input label="GitHub Username / Author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
            <Input label="License" value={license} onChange={(e) => setLicense(e.target.value)} />
            <Input label="Repository Link" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />

            <div className="contrib-steps">
              <h4>GitHub Contribution Workflow</h4>
              <ol className="steps-list">
                <li>Download your Contribution Package below.</li>
                <li>Fork the <code>ui-explorer</code> repository on GitHub.</li>
                <li>Add your files under <code>{`styles/community/${currentStyle.metadata.id}/`}</code>.</li>
                <li>Submit a Pull Request for validation.</li>
              </ol>
            </div>

            <Button variant="primary" icon={<Download size={16} />} onClick={handleDownloadAll} fullWidth>
              Download Contribution Package (.JSON & .MD)
            </Button>
          </div>

          <div className="contrib-preview-col">
            <h3>Package Contents Preview</h3>
            <div className="preview-file">
              <span className="file-name"><FileCode size={14} /> metadata.json</span>
              <Textarea value={metadataJson} readOnly rows={6} className="code-textarea" />
            </div>

            <div className="preview-file">
              <span className="file-name"><FileCode size={14} /> README.md</span>
              <Textarea value={readmeContent} readOnly rows={4} className="code-textarea" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
