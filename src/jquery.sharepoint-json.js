/* 
jQuery SharePoint XML to JSON

Usage:

$(xml).sharePointJSON(options);

where 'xml' is XML document returned from a SP web service call to 'GetListItems' (i.e. xdata.responseXML()),
and 'options' (optional) is an object containing the following options (both likewise optional):

  mapping: A mapping object of {jsonAttrs: "ows_SharePointColumns"}.  This object defines a mapping
    between SharePoint columns and JavaScript object keys.  Each SharePoint list item will be
    parsed into a JavaScript object with the jsonAttrs as keys whose values are those of
    the corresponding SharePoint columns.  The SP column names can be identified by inspecting the
    AJAX return from the web service call to 'GetListItems'.
    The mapping can also contain a special entry pointing to the source list:
      listURL: "http://somesharepointsite.example.com/sitename/Lists/listname" ... }.

  callback: A function to be called for each object parsed from the xml.  This function should take a
    single argument, the object parsed from the XML, and its return value will be added to the array to be returned from the
    main sharePointJSON function.  It is recommended that the callback return the object itself, modified in some way.

Returns
It returns an array of objects corresponding to the list items.
*/
(function($) {
  var sanitizeColumnValue = function(value) {
    if (!value || value === "") return null;
    // Multiple, non-lookup values
    if (value.match(/^;#/)) {
      value = value.replace(/^;#/, "").replace(/;#$/, "").split(";#");
      return value;
    }
    // Lookup value, possibly multiple
    if (value.match(/;#/)) {
      if (value.split(";#").length > 2) {
        // Multiple values
        var tmpPropertyValueSplit = value.split(";#");
        value = [];
        propertyIndex = [];
        $.each(tmpPropertyValueSplit, function(index, val){
          if (index % 2 == 0) {
            // Even index => lookup index
            propertyIndex.push(val);
          } else {
            // Odd index => lookup value
            value.push(val);
          }
        });
        return value;
      }
      
      // Single value
      // Possibly a Calculated field type;#value pair
      propertyIndex = value.split(";#")[0];
      value = value.split(";#")[1];
    }
    // Single, non-lookup value
    return value;
  }
  
  $.fn.sharePointJSON = function(options){
    var settings = {
      mapping: {created: "ows_Created", modified: "ows_Modified", title: "ows_Title"},
      callback: null
    };
    
    if (options) { 
      $.extend(settings, options);
    }
    
    var mapping = settings['mapping'];
    var callback = settings['callback'];
    
    if (!$.isPlainObject(mapping)) {
      mapping = {};
    }
    if (!$.isFunction(callback)){
      callback = null;
    }
    
    var events = [];
    
    this.find('[nodeName="z:row"]').each(function(){
      var $this = $(this);
      var event = {};

      for (var attr in mapping) {
        var column = mapping[attr];
        if (column) {
          if (attr === 'listURL') {
            event.link = mapping['listURL'] + "/DispForm.aspx?ID=" + $this.attr("ows_ID") + "&Source=" + encodeURIComponent(document.location.href);
            continue;
          }
          
          var value = sanitizeColumnValue($this.attr(column)) || "";
          event[attr] = value;
        }
      }
      
      console.log(event);
      
      // Custom post-processing can be done in callback function
      if (callback) {event = callback(event);}
      if (event) {events.push(event);}
    });

    return events;
  };
})(jQuery);

