validate(/*!#validate*/{
	"user_form":{
		"name":{
			"test":[
				["length-gt", 0, "You name must not be empty."],
				["length-lte", 100, "Your name must not be longer than 100 characters."]
			]
		},
		"age":{
			"test":[
				["gte", 13, "You have to be at least 13 years old."]
			]
		},
		"country":{
			"trim":false,
			"test":[
				["range", ["us", "fr", "de"], "You have to live in one of the following countries: USA, France, Germany"]
			]
		},
		"birth":{
			"test":[
				["match", "^\\d{2}\\.\\d{2}\\.\\d{4}$", "The birthday's format isn't correct. Correct format: DD.MM.YYYY"]
			]
		},
		"key":{
			"trim":false,
			"test":[
				["eq", "abc123", "Wrong key."]
			]
		}
	}
}/*!#/validate*/, function(el_form, map_fail){
	$(".validate", el_form).remove();
	
	var jq_validate=$('<div class="validate">');
	
	$(el_form).prepend(jq_validate);
	
	jq_validate.append('<div>The input data is invalid.</div>');
	
	validate.each(map_fail, function(key, val){
		if(val==null){
			jq_validate.append($('<div>').text('The input field "'+key+'" is missing.'));
		}else{
			validate.each(val, function(i, val){
				var jq_validate_b=$('<div class="validate">');
				
				$(val.shift()).before(jq_validate_b);
				
				validate.each(val, function(i, val){
					jq_validate_b.append($('<div>').text(val));
				});
			});
		}
	});
}
/** /
,function(el_form, map_success){
	$(".validate", el_form).remove();
	
	$(el_form).prepend('<div class="validate valid">The input data is valid.</div>');
	
	validate.each(map_success, function(key, val){
		validate.each(val, function(i, val){
			$(val).before($('<div class="validate valid">').text('"'+key+'" is valid.'));
		});
	});
}
/**/
);
