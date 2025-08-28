"""Document provider protocols for Tenzir Docs MCP Server."""

from typing import Any, Dict, List, Optional, Protocol, Union
from pydantic import BaseModel, Field


class DocumentNotFoundError(Exception):
    """Raised when a requested document cannot be found."""
    pass


class BinaryFile(BaseModel):
    """Represents a binary file with content type and data."""
    
    content_type: str = Field(..., description="MIME type of the file")
    data: bytes = Field(..., description="Binary content of the file")


class SearchResult(BaseModel):
    """Represents a search result from the documentation."""
    
    document_path: str = Field(..., description="Path to the document")
    line_number: Optional[int] = Field(None, description="Line number of the match")
    match_line: Optional[str] = Field(None, description="The line containing the match")
    context: List[str] = Field(default_factory=list, description="Context lines around the match")
    file_path: Optional[str] = Field(None, description="Filesystem path to the file")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return self.model_dump(exclude_none=True)


class DocsProvider(Protocol):
    """Protocol for documentation providers."""
    
    def search(self, query: str, limit: Optional[int] = 10) -> List[SearchResult]:
        """Search through documentation.
        
        Args:
            query: Search query string
            limit: Maximum number of results to return
            
        Returns:
            List of search results
        """
        ...
    
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
        ...