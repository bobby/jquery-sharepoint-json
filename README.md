# jQuery SharePoint JSON

This simple jQuery plugin converts XML returned from SharePoint's web services and converts it to JSON.

## Features

* Converts XML elements representing list items into JSON objects according to a user-defined mapping object
* Designed to be used with [Marc D. Anderson](http://www.endusersharepoint.com/category/authors/marc-d-anderson/)'s excellent [jquery.SPServices](http://spservices.codeplex.com/) library


## Usage

    $(xml).sharePointJSON(options);

Where 'xml' is XML document returned from a SP web service call to 'GetListItems' (i.e. xdata.responseXML()), and 'options' (optional) is an object containing the following options (both likewise optional):

### Options

* mapping: A mapping object of {jsonAttrs: "ows_SharePointColumns"}.  This object defines a mapping between SharePoint columns and JavaScript object keys.  Each SharePoint list item will be parsed into a JavaScript object with the jsonAttrs as keys whose values are those of the corresponding SharePoint columns.  The SP column names can be identified by inspecting the AJAX return from the web service call to 'GetListItems'.  The mapping can also contain a special entry pointing to the source list:
  * listURL: "http://somesharepointsite.example.com/sitename/Lists/listname" ... }.
  If this option is not given, only 'title', 'created' and 'modified' will be parsed out, using the default column names from a SP list.
  This function is smart enough about SP XML to parse out arrays, lookup values, etc.
* callback: A function to be called for each object parsed from the xml.  This function should take a single argument, the object parsed from the XML, and its return value will be added to the array to be returned from the main sharePointJSON function.  It is recommended that the callback return the object itself, modified in some way.

### Returns

It returns an array of objects corresponding to the list items.

## Example

Here's the most basic example (this will only parse out 'title', 'created', and 'modified'.):

    $.post("http://sharepointsite.example.com/_vti_bin/Lists.asmx", soapRequestXML, function(data){
      var json = $(data).sharePointJSON();
      // Do some stuff...
    });

Here's an example with a mapping object:

    var mapping = {foo: "ows_Foo", barBaz: "ows_Bar_x0020_Baz"};
    
    $.post("http://sharepointsite.example.com/_vti_bin/Lists.asmx", soapRequestXML, function(data){
      var json = $(data).sharePointJSON({mapping: mapping});
      
      $.isArray(json) // True
      $.each(function(i, obj){
        console.log("foo: %o", obj.foo);
        console.log("barBaz: %o", obj.barBaz)
      });
    });

And here's an example of using an object callback:

    var callback = function(obj){obj.foo = "<b>" + obj.foo + "</b>"; return obj;};
    var mapping = {foo: "ows_Foo", barBaz: "ows_Bar_x0020_Baz"};
    
    $.post("http://sharepointsite.example.com/_vti_bin/Lists.asmx", soapRequestXML, function(data){
      var json = $(data).sharePointJSON({mapping: mapping});
      
      $.isArray(json) // True
      $.each(function(i, obj){
        console.log("foo: %o", obj.foo); // prints "foo: <b>[value of "foo"]</b>"
        console.log("barBaz: %o", obj.barBaz)
      });
    });
