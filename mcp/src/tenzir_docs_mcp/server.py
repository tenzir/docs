#!/usr/bin/env python3
"""Tenzir Docs MCP Server

A FastMCP server providing tools for Tenzir documentation access.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from fastmcp import FastMCP
from fastmcp.utilities.types import Image
from mcp.types import ImageContent
from pydantic import BaseModel, Field
from tenzir_docs_mcp.docs_provider_filesystem import FilesystemDocsProvider
from tenzir_docs_mcp.docs_provider import DocsProvider, BinaryFile, SearchResult
from tenzir_docs_mcp.summary import SUMMARY

mcp: FastMCP = FastMCP("tenzir-docs")

# Initialize the docs provider
docs_provider: DocsProvider = FilesystemDocsProvider()


class SearchResponse(BaseModel):
    """Response model for search results."""
    
    document_path: str = Field(..., description="Path to the document")
    match_line: str = Field(..., description="The line containing the match")
    context: List[str] = Field(default_factory=list, description="Context lines around the match")


@mcp.tool()
def search_docs(keyword: str) -> List[Dict[str, Any]]:
    """Search through Tenzir documentation. This is a very basic search tool that
    does not support fuzzy matching, so only use a single keyword.
    
    Args:
        keyword: What to look for.
        
    Returns:
        List of search results with titles, excerpts, and URLs. Up to 10 results.
    """
    LIMIT = 10
    try:
        search_results = docs_provider.search(keyword, LIMIT)
        
        # Convert SearchResult to SearchResponse
        responses = []
        for result in search_results:
            response = SearchResponse(
                document_path=result.document_path,
                match_line=result.match_line or "",
                context=result.context or []
            )
            responses.append(response.model_dump())
        
        return responses
    except FileNotFoundError as e:
        return [{"error": str(e)}]
    except RuntimeError as e:
        return [{"error": str(e)}]
    except Exception as e:
        return [{"error": f"Search error: {str(e)}"}]


@mcp.tool()
def read_docs_page(doc_path: str) -> str:
    """Read the content of a specific documentation page.

    Args:    
        doc_path:
            Document path (e.g., '/guides/basic-usage/install-a-package' or '/index')
            Can be obtained in several ways:
                - Returned by the 'search_docs' tool
                - Found in the output from the 'summary' tool
                - Derived from a docs url you found (e.g. https://docs.tenzir.com/guides -> /guides)
                - For operator or function reference docs, you can directly
                  construct the path from the operator name like /reference/operators/assert
                  for the assert operator, or /reference/operators/ocsf/apply for the
                  ocsf::apply operator.

            Note: For images, use the 'view_docs_image' tool instead.
        
    Returns:
        String containing the document content
    """
    try:
        result = docs_provider.read_document(doc_path)
        if isinstance(result, BinaryFile):
            return f"Error: '{doc_path}' is a binary file. Use the 'view_docs_image' tool to view images."
        return result
    except Exception as e:
        return f"Error: {str(e)}"


@mcp.tool()
def view_docs_image(image_path: str) -> ImageContent:
    """View an image from the documentation.

    Args:
        image_path: 
            Path to the image file (e.g., '/images/diagram.svg' or '/images/screenshot.png')
            Can be obtained from documentation pages or search results.
        
    Returns:
        ImageContent containing the image data
    """
    try:
        result = docs_provider.read_document(image_path)
        if isinstance(result, str):
            raise ValueError(f"'{image_path}' is not an image file. Use 'read_docs_page' for text content.")
        
        # Convert BinaryFile to ImageContent using FastMCP Image utility
        # Determine format from content type
        format_map = {
            'image/png': 'png',
            'image/jpeg': 'jpeg', 
            'image/jpg': 'jpeg',
            'image/gif': 'gif',
            'image/svg+xml': 'svg',
            'image/webp': 'webp'
        }
        
        image_format = format_map.get(result.content_type, 'png')
        img_obj = Image(data=result.data, format=image_format)
        return img_obj.to_image_content()
        
    except Exception as e:
        # Return error as a simple text image for better user experience
        error_msg = f"Error loading image '{image_path}': {str(e)}"
        # Create a minimal error response - we can't return string from this tool
        # so we'll re-raise the exception to let FastMCP handle it
        raise ValueError(error_msg)


# Logically this should be a "resource", but mcp resources aren't very well
# supported across clients at the moment.
@mcp.tool()
def summary() -> str:
    """A comprehensive summary of Tenzir documentation, including the basics
    of writing TQL pipelines and pointers to additional docs pages.
    """
    return SUMMARY


if __name__ == "__main__":
    mcp.run()