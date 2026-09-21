import React, { useState } from 'react';
import { useStyle } from '../../hooks/useStyle';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Download, GitPullRequest, X, FileCode, ExternalLink } from 'lucide-react';
import { renderStylePreviewSvg } from '../../engine/preview';
import { GITHUB_REPO_URL } from '../../config/app';
import './ContributionPackageModal.css';

export const ContributionPackageModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentStyle } = useStyle();
  const [authorName, setAuthorName] = useState('github_username');
  const [license, setLicense] = useState('MIT');
  const [repoUrl, setRepoUrl] = useState(`${GITHUB_REPO_URL}/tree/main/styles/community`);

  // Registry slug and id: community packages are conventionally prefixed.
  const slug = currentStyle.metadata.id.replace(/^community-/, '');
  const packageId = `community-${slug}`;

  // metadata.json doubles as the entry to append to styles/community/index.json.
  const metadataJson = JSON.stringify(
    {
      id: packageId,
      name: currentStyle.metadata.name,
      author: authorName,
      version: '1.0.0',
      license,
      category: currentStyle.metadata.category,
      description: currentStyle.metadata.description,
      tags: currentStyle.metadata.tags,
      path: `styles/community/${slug}/style.json`,
      repository: repoUrl
    },
    null,
    2
  );

  // style.json is the package itself: provenance lives in metadata so it loads as-is.
  const { generation: _generation, ...definition } = currentStyle;
  const { isCustom: _isCustom, ...metadata } = definition.metadata;
  const styleJson = JSON.stringify(
    { ...definition, metadata: { ...metadata, id: packageId, author: authorName, version: '1.0.0', license, source: 'community' } },
    null,
    2
  );

  const readmeContent = `# ${currentStyle.metadata.name}

Contributed to UI Explorer by **${authorName}**.

## Metadata
- **Category**: ${currentStyle.metadata.category}
- **License**: ${license}
- **Repository**: ${repoUrl}

## Description
${currentStyle.metadata.description}

## Install

Copy this folder to \`styles/community/${slug}/\` in the UI Explorer repository, append the
contents of \`metadata.json\` to \`styles/community/index.json\`, run
\`npm run registry:check\` and open a pull request.
`;

  // preview.svg is rendered from the tokens themselves, so it always represents the style faithfully.
  const previewSvg = renderStylePreviewSvg({ ...definition, metadata: { ...metadata, id: packageId } });

  const handleDownloadFile = (content: string, filename: string, type = 'text/plain;charset=utf-8') => {
    const blob = new Blob([content], { type });
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
    handleDownloadFile(previewSvg, `${currentStyle.metadata.id}-preview.svg`, 'image/svg+xml;charset=utf-8');
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
            <p className="contrib-hint">Use your own name or GitHub handle — packages are published under the author you enter here.</p>
            <Input label="GitHub Username / Author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
            <Input label="License" value={license} onChange={(e) => setLicense(e.target.value)} />
            <Input label="Repository Link" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />

            <div className="contrib-steps">
              <h4>GitHub Contribution Workflow</h4>
              <ol className="steps-list">
                <li>Download your Contribution Package below.</li>
                <li>Fork the <code>ui-explorer</code> repository on GitHub.</li>
                <li>Add the four files under <code>{`styles/community/${slug}/`}</code> and append <code>metadata.json</code> to <code>index.json</code>.</li>
                <li>Run <code>npm run registry:check</code>, then open a pull request.</li>
              </ol>
            </div>

            <Button variant="primary" icon={<Download size={16} />} onClick={handleDownloadAll} fullWidth>
              Download Contribution Package (4 files)
            </Button>
            <div className="contrib-next">
              <strong>Next step</strong>
              <span>Submit this style through GitHub.</span>
              <a href={`${GITHUB_REPO_URL}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer"><ExternalLink size={13} /> Contribution guide</a>
            </div>
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

            <div className="preview-file">
              <span className="file-name"><FileCode size={14} /> preview.svg</span>
              <img className="contrib-preview-img" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(previewSvg)}`} alt={`${currentStyle.metadata.name} preview`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
