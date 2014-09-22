#validate

##Overwiew

*validate* is a simple validation framework consisting of a client-side part written in JavaScript and a server-side part written in PHP.  
It aims to be very flexible and helps to avoid repetition in your code and keep your validation schemas consistent between the client-side and the server-side code.  
Moreover it is standalone and has no dependencies.

##API

###The `test` object

The `test` object specifies the validation schemas for the different fields and forms. It has the same structure in JavaScript and PHP and is optimally written only 1 time in the JavaScript file, but used in JavaScript *and* PHP which helps to keep the logic consistent between the server and the client.  
Below an abstracted example of the object, formatted in JSON, is shown.

<pre><code>{
    "form_name":{
        "field_name":{
            "trim":true,
            "required":true,
            "test":[
                ["gt", 10, "Must be greater than 10."],
                ["eq", "foo", "Doesn't match the term \"foo\"."],
                ["length", 11, "Must be exactly 11 characters long."],
                ["range", ["us", "fr", "de"], "Your country isn't supported."],
                ["match", "^[a-z]+$", "i", "Must contain letters only."]
                <i>//...</i>
            ]
        }
        <i>//...</i>
    }
    <i>//...</i>
}</code></pre>

`form_name` is the name of the form the descending fields are nested in. The form is named by including an element with its `name` attribute set to the `*form_name*`.  
`field_name` is the name of the field specified by its `name` attribute.  
The options `trim` and `required` can be specified for each field separately and default to the default configuration. See below for more details on the options and on the configuration method.  

####`test`

`test` is an array containing the tests that are executed on the field's value.  
Each test itself is also an array. They have the following form:

<pre><code><b>[</b> string operation, mixed argumentN [, mixed ...], string fail_message <b>]</b></code></pre>

`fail_message` is the message used when the test failed and is required - at least it must be an empty string.  
`operation` and `argumentN` are described below.

+   `eq`: `string argument`  
    The value must be equal to `argument`.
+   `gt`, `gte`, `lt`, `lte`, `length-gt`, `length-gte`, `length-lt`, `length-lte`: `number argument`  
    The value is casted as a number and gets compared to `argument`. It must be either *greater than* (`gt`), *greater than or equal* (`gte`), *lower than* (`lt`) or *lower than or equal* (`lte`). If the operator is prefixed with `length-`, the value's length is used instead of the casted value.
+   `length`: `number argument`
    The value's length must be equal to `argument`.
+   `range`: `[number|string start,] number|string end [, number step]` or `string[] options`  
    If an array is passed as argument (`options`), the test is successful if one of the array's items matches the value.  
    Otherwise up to 3 arguments are accepted. The first one is optional and specifies the start position of the range. If it is omitted, the start position is calculated by the value of `end`. `end` specifies the end position of the range. It has always greater importance than `start`. `step` specifies the difference between 2 items. If `start` is greater than `end` step must be set explicitly to a negative number. If `start` or `end` are strings, they are truncated to 1 character. If `start` doesn't match `end`'s case or it's region (A-Z, 0-9), it's changed appropriately.
+   `match`: `string pattern [, string flags]`
    The value must match a regular expression. The regular expression is built using `pattern` and the RegExp `flags`.

###JavaScript

####`void validate( object testObject [, function onfail [, function onsuccess]] )`

The function expects the `testObject`, described above to be the first argument and binds every form's submit event to an event handler. When one of the fields, specified for the form doesn't pass all test the form won't be submitted and `onfail` is called. Otherwise it is submitted and `onsuccess` is called. This would be the right place for calling `event.preventDefault()` if you wish to stop the submission and submit the form data via AJAX for example.

`onfail` accepts the following arguments: `string form, object fail`.  
`form` contains the form's `DOMElement`.
`fail` contains all fields of the form `form` that failed in at least 1 test. It has the following form:

<pre><code>{
    "field_name":[
        [<i>DOMElement</i>, "Must be greater than 10.", "Must be exactly 11 characters long."],
        [<i>DOMElement</i>, "Must contain letters only."]
        <i>//...</i>
    ],
    "field_name_2":[
        [<i>DOMElement</i>, "Must not be longer than 100 characters."]
    ],
    "field_name_3":null
    <i>//...</i>
}</code></pre>

The field names are used as the object's keys. A field's value is either an array or `null`. A value of `null` means that the field doesn't exist at all (and its `required` option is set to `true`, see below).  
Array values contain more arrays, one for each field instance, containing the `DOMElement` of the field instance and the error messages of the failed tests. The different instances of a field can contain different error messages. The array's first item is the `DOMElement` of the field instance. The subsequent items represent the error messages.

`onsuccess` accepts the following arguments: `string form, object success`.  
`form` contains the form name.
`success` contains all fields of the form `form` that passed all tests successfully. It has the following form:

<pre><code>{
    "field_name":[<i>DOMElement</i>, <i>DOMElement</i> <i>/*...*/</i>],
    "field_name_2":[<i>DOMElement</i>]
    <i>//...</i>
}</code></pre>

The field names are used as the object's keys. A field's value is an array containing the `DOMElement`s of the field instances.

####`object validate.conf( [object options] )`

This function sets and gets the global settings.  
If `options` is specified, the options contained in that object will overwrite the current settings. Otherwise no settings are set.  
The function returns a copy of the settings object after overwriting its options with the ones in `options`.  
The following options are available and can also be specified field-specific by specifying them in the `testObject`. Options, not specified that way are taken from the global configuration.

+   `bool trim`: Sets whether to remove all whitespaces before and after the field's value. If set to `true`, the value is trimmed *before* any test is executed.
+   `bool required`: If set to `true`, at least 1 instance of the field must be found within the form. Otherwise the field is simply ignored.

####Other functions

The following functions are also available but aren't related to `validate`'s functionality.  
See source code for more information.

+   `void validate.noop()`
+   `string validate.type( mixed var )`
+   `string validate.trim( string string )`
+   `bool validate.isArray( mixed var )`
+   `bool validate.inArray( mixed needle, array haystack [, bool strict=false] )`
+   `bool validate.isEmpty( object object )`
+   `object validate.newInstance( object instance )`
+   `void validate.each( object object, function iterate [, bool treatArrayAsObject=false] )`
+   `object validate.merge( [int optionsIndex,] object target [, object objectN [, object ...]] )`
+   `object validate.clone( object object )`
+   `array validate.range( [number|string start,] number|string end [, number step] )`

###PHP

####`bool|null validate( array|string $testObject_or_file [, array &$result [, string &$form [, string $request_method=null]]] )`

The function loops to all the fields contained by the first form in the `testObject` that was found in the data sent along with the request and mathes their values against the tests for that field.  
The `testObject` (described above) can be specified as the first argument of the function (`$testObject_or_file`).  Alternatively the first argument can be a string being a path to a file containing the `testObject`. In that case the `testObject` must be a JSON-compliant object wrapped into `/*!#validate*/` and `/*!#/validate*/`. Internally this function uses PHP's `json_decode()` function which requires UTF-8-encoded data. Therfore the specified file must be encoded in UTF-8. Optimally the specified file should be the JavaScript file, so that both files and both parts (server-side and client-side) are using exactly the same `testObject`. Note that JSON is a subset of JavaScript, which means that the JSON-compliant `testObject` can be notated in to JavaScript file as a simple, literal object.  
`$result` will become either an array containing the fields that failed in at least 1 test or an array containing the fields that passed all tests, regarding to `validate()`'s return value. For more information see below.  
`$form` will become the name of the form whose fields were tested.  
If `$request_method` is set to `null`, it defaults to `strtolower($_SERVER["REQUEST_METHOD"])`. If the final value is `get`, the sent data are retrieved from `$_GET`. In any other case `$_POST` is used instead.

If no form is found in the sent data, `null` is returned and neither `$result`, nor `$form` is set.  
Otherwise, if the one or more tests for the form's fields fail, `false` is returned and `$result` is set to an array of the following form:

<pre><code>array(
    "field_name"=>array(
        array("Must be greater than 10.", "Must be exactly 11 characters long."),
        array("Must contain letters only.")
        <i>//...</i>
    ),
    "field_name_2"=>array(
        array("Must not be longer than 100 characters.")
    ),
    "field_name_3"=>null
    <i>//...</i>
)</code></pre>

The field names are used as the array's keys. A field's value is either an array or `null`. A value of `null` means that the field doesn't exist at all (and its `required` option is set to `true`, see below).  
Array values contain more arrays, one for each field instance, containing the error messages of the failed tests. The different instances of a field can contain different error messages.

If all fields' values pass the tests, `true` is returned and `$result` will become an array of the following form:

<pre><code>array(
    "field_name"=>2,
    "field_name_2"=>1
    <i>//...</i>
)</code></pre>

The field names are used as the array's keys and the values represent the numbers of the field's instances.

####`array validate_conf( [array $options] )`

This function sets and gets the global settings.  
If `$options` is specified, the options contained in that array will overwrite the current settings. Otherwise no settings are set.  
The function returns a copy of the settings array after overwriting its options with the ones in `$options`.  
The following options are available and can also be specified field-specific by specifying them in the `testObject`. Options, not specified that way are taken from the global configuration.

+   `bool trim`: Sets whether to remove all whitespaces before and after the field's value. If set to `true`, the value is trimmed *before* any test is executed.
+   `bool required`: If set to `true`, at least 1 instance of the field must be found within the form. Otherwise the field is simply ignored.
