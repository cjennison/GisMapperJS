GISMAPPER

//---------------------

index.html

	Entry file for web mapper
	
/App

	Application Specific Files
	
/Style

	Application Specific Styling
	
/Library

	Core Engine and Styling

/Config

	Configuration Files
	

//--------------------------

User Configuration

APPLICATIONS

	An array of applications to be added to the project
	
-- Application

title: The Application Title noted for entry by the URL parameters

html_title: The Title for the HTML Page

dir: The directory for all of your application files

main: Main entry file for your application

sources: All other files

partner_sources: Any files with exact directory paths that use your partner application's code


//-----------------------------

Partner Sources

if you intend to use partner sources, do not add Load Start function to these files.

They can cause errors in the sister application loading your source.

The only file that should contain load start functions (function(){}) should be your main entry file.
