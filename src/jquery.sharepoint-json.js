(function($) {

  $.fn.sharepointJSON = function(mapping){
    
  };
})(jQuery);

SharePointJSON = {};

SharePointJSON._sanitizeColumnValue = function(value) {
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

// This function takes the XML document returned from a SP web service call to 'GetListItems'
// and a mapping of {TimelineAttrs: "ows_SharePointAttrs"}, the latter being optional.
// The mapping can also contain a special entry: { ... listURL: "http://somesharepointsite.example.com/sitename/Lists/listname" ... }
// which forms the base of the list item URL (e.g. "http://somesharepointsite.example.com/sitename/Lists/listname/DispForm.aspx?ID=1234").
//
// It returns a Javascript array of list items.
// If defined, callback is called on each event after it's parsed from the XML, but before it's added to the item array;
SharePointJSON.parseSharePointXML = function(xml, mapping, callback) {
  if (!$.isPlainObject(mapping)) {
    mapping = {};
  }
  if (!$.isFunction(callback)){
    callback = null;
  }

  // Sensible defaults, if not present
  var defaults = {start: "ows_Created", end: "ows_Modified", title: "ows_Title"};
  mapping = $.extend({}, defaults, mapping);

  var events = [];
  
  $(xml).find("[nodeName=z:row]").each(function(){
    var self = $(this);
    var event = {};

    for (var attr in mapping) {
      var column = mapping[attr];
      if (column) {
        if (attr === 'listURL') {
          event.link = mapping['listURL'] + "/DispForm.aspx?ID=" + self.attr("ows_ID") + "&Source=" + encodeURIComponent(document.location.href);
          continue;
        }
        
        var value = SharePointJSON._sanitizeColumnValue(self.attr(column)) || "";
        event[attr] = value;
      }
    }
    
    // Custom post-processing can be done in callback function
    if (callback) {event = callback(event);}
    if (event) {events.push(event);}
  });

  return events;
}