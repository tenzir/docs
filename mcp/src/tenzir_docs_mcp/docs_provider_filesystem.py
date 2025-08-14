"""Filesystem-based implementation of DocsProvider."""

import subprocess
from pathlib import Path
from typing import List, Optional, Dict, Any, Union

from .docs_provider import SearchResult, DocumentNotFoundError, BinaryFile

# Configuration
CONTENT_PATH = Path(__file__).parent.parent.parent.parent / "src" / "content" / "docs"


def _file_path_to_doc_path(file_path: str, content_path: Path) -> str:
    """Convert a file path to a document path."""
    path = Path(file_path)
    
    # Make path relative to content_path if it's absolute
    if path.is_absolute():
        try:
            path = path.relative_to(content_path)
        except ValueError:
            # If path is not under content_path, just use the name
            path = Path(path.name)
    
    # Remove the extension
    doc_path = str(path.with_suffix(''))
    
    # Ensure it starts with /
    if not doc_path.startswith('/'):
        doc_path = '/' + doc_path
    
    return doc_path


def _doc_path_to_file_path(doc_path: str, content_path: Path) -> Path:
    """Convert a document path back to a file path.
    
    Args:
        doc_path: The document path to convert
        content_path: The base content directory path
        
    Returns:
        Path to the file
        
    Raises:
        DocumentNotFoundError: If no document file is found
    """
    # If path ends with '/', remove the trailing slash
    if doc_path.endswith('/'):
        doc_path = doc_path.rstrip('/')
    
    # Don't remove leading slash, but handle it properly
    if doc_path.startswith('/'):
        doc_path = doc_path[1:]
    
    # If empty after removing slash, it's the root index
    if not doc_path:
        doc_path = "index"
    
    # Try different possible file extensions and locations
    possible_paths = [
        content_path / doc_path,  # Try exact path first in case it already has extension
        content_path / f"{doc_path}.md",
        content_path / f"{doc_path}.mdx",
        content_path / f"{doc_path}.mdoc",
        content_path / f"{doc_path}.svg",
        content_path / f"{doc_path}.png",
        content_path / f"{doc_path}/index.mdoc"  # Try index.mdoc as final alternative
    ]
    
    # Return the first path that exists
    for path in possible_paths:
        if path.exists():
            return path
    
    # If no file found, raise exception
    raise DocumentNotFoundError(f"Document not found: {doc_path}")


class FilesystemDocsProvider:
    """Filesystem-based documentation provider."""
    
    def __init__(self):
        """Initialize the filesystem provider.
        
        Args:
            content_path: Base path to the documentation content
        """
        self.content_path = CONTENT_PATH
    
    def search(self, query: str, limit: Optional[int] = 10) -> List[SearchResult]:
        """Search through documentation using ripgrep.
        
        Args:
            query: Search query string
            limit: Maximum number of results to return
            
        Returns:
            List of search results
        """
        if not self.content_path.exists():
            raise FileNotFoundError(f"Content path not found: {self.content_path}")
        
        try:
            # Use ripgrep to search through markdown files with context
            effective_limit = limit if limit is not None else 10
            cmd = [
                "rg",
                "--type", "md",
                "--line-number",
                "--context", "1",
                "--max-count", str(effective_limit * 2),  # Get more matches to account for filtering
                query,
                str(self.content_path)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(self.content_path))
            
            if result.returncode != 0:
                if result.returncode == 1:
                    # No matches found
                    return []
                raise RuntimeError(f"Search failed: {result.stderr}")
            
            # Parse ripgrep output
            results: List[SearchResult] = []
            current_file: Optional[str] = None
            current_matches: List[Dict[str, Any]] = []
            
            for line in result.stdout.split('\n'):
                if not line.strip():
                    continue
                    
                if line.startswith('--'):
                    # Separator between files or match groups
                    if current_file and current_matches:
                        # Process accumulated matches for current file
                        doc_path = _file_path_to_doc_path(current_file, self.content_path)
                        for match_info in current_matches:
                            if len(results) >= effective_limit:
                                break
                            results.append(SearchResult(
                                document_path=doc_path,
                                line_number=int(match_info["line_number"]),
                                match_line=match_info["match_line"],
                                context=match_info["context"],
                                file_path=current_file
                            ))
                    current_matches = []
                    continue
                
                # Parse file:line:content format
                if ':' in line:
                    parts = line.split(':', 2)
                    if len(parts) >= 3:
                        file_path = parts[0]
                        line_num = parts[1]
                        content = parts[2]
                        
                        # Track current file
                        if file_path != current_file:
                            current_file = file_path
                            current_matches = []
                        
                        # Check if this is a match line (contains the query)
                        if query.lower() in content.lower():
                            current_matches.append({
                                "line_number": line_num,
                                "match_line": content,
                                "context": []  # Context will be added by collecting surrounding lines
                            })
            
            # Process final file
            if current_file and current_matches:
                doc_path = _file_path_to_doc_path(current_file, self.content_path)
                for match_info in current_matches:
                    if len(results) >= effective_limit:
                        break
                    results.append(SearchResult(
                        document_path=doc_path,
                        line_number=int(match_info["line_number"]),
                        match_line=match_info["match_line"],
                        context=match_info["context"],
                        file_path=current_file
                    ))
            
            return results[:effective_limit]
            
        except Exception as e:
            raise RuntimeError(f"Search error: {str(e)}")
    
    def read_document(self, doc_path: str) -> Union[str, BinaryFile]:
        """Read the content of a specific document.
        
        Args:
            doc_path: Document path (e.g., '/guides/basic-usage/install-a-package')
            
        Returns:
            String containing the document content for text files,
            or BinaryFile for image files
            
        Raises:
            DocumentNotFoundError: If the document cannot be found
        """
        # Convert document path back to file path
        file_path = _doc_path_to_file_path(doc_path, self.content_path)
        
        try:
            # Check if it's a binary file (image)
            if file_path.suffix.lower() in ['.svg', '.png']:
                # Read as binary and determine content type
                with open(file_path, 'rb') as f:
                    data = f.read()
                
                content_type = {
                    '.svg': 'image/svg+xml',
                    '.png': 'image/png'
                }.get(file_path.suffix.lower(), 'application/octet-stream')
                
                return BinaryFile(content_type=content_type, data=data)
            else:
                # Read as text
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
        except FileNotFoundError:
            raise DocumentNotFoundError(f"Document not found: {doc_path}")
        except Exception as e:
            raise RuntimeError(f"Failed to read document: {str(e)}")