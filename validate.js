(function(win, doc, conf, noop, type, trim, isArray, inArray, isEmpty, newInstance, each, merge, clone, range){
	var args=Array.prototype.slice.call(arguments, 2),
		map_settings={
			"trim":true,
			"required":true,
			"test":[]
		},
		
		/**
		 * void validate( object test [, function onfail [, function onsuccess]] )
		 */
		validate=function(map_test, fn_fail, fn_success){
			fn_fail=fn_fail==null ? noop : fn_fail;
			fn_success=fn_success==null ? noop : fn_success;
			
			each(map_test, function(key, val){ //for each form
				var arr_forms=doc.querySelectorAll("form [name='"+key+"']");
				
				each(arr_forms, function(i, el_form){ //for each instance of that form
					while((el_form=el_form.parentNode)!=null){
						if(el_form.nodeType==doc.ELEMENT_NODE && el_form.nodeName.toLowerCase()=="form"){
							break;
						}
					}
					
					el_form.addEventListener("submit", function(e){
						var map_fail={}, //the fields within that form instance that failed the tests
							map_success={}; //the fields within that form instance that satisfied the tests
						
						each(val, function(key, val){ //for each field within that form
							var map_options=merge({}, map_settings, val),
								arr_inputs=el_form.querySelectorAll("[name='"+key+"']");
							
							if(arr_inputs.length>0){
								var arr_fail=[], //the field instances within that form instance that failed the tests
									arr_success=[]; //the field instances within that form instance that satisfied the tests
								
								each(arr_inputs, function(i, el_input){ //for each instance of that field within that form instance
									var str_val=map_options.trim ? trim(el_input.value) : el_input.value,
										arr_msg=[]; //the failed tests for that field instance
									
									each(map_options.test, function(i, val){ //for each test of that field for that field instance
										var str_op=val.shift(),
											str_msg=val.pop(),
											q_valid=true;
										
										if(str_op=="match"){
											var re_match=new RegExp(val[0], val[1]);
											
											if(str_val.match(re_match)==null){
												q_valid=false;
											}
										}else if(str_op=="range"){
											var arr_range=type(val[0])=="object" ? val[0] : range.apply(null, val); //actually `type(val[0])=="object" && isArray(val[0])`
											
											if(!inArray(str_val, arr_range)){
												q_valid=false;
											}
										}else if(str_op=="eq" || str_op=="length"){
											var mix_val;
											
											if(str_op=="length"){
												mix_val=str_val.length;
											}else{
												mix_val=str_val;
											}
											
											if(mix_val!=val[0]){
												q_valid=false;
											}
										}else{
											var arr_a=str_op.match(/^(?:(length)-)?([lg]te?)$/);
											
											if(arr_a!=null){
												var q_a=false,
													str_op_b=arr_a[2],
													num_a;
												
												if(arr_a[1]==="length"){ //if no prefix ("length" for example) was found, `arr_a[1]` will be `undefined`. Due to that compare using `===`
													num_a=str_val.length;
												}else{
													num_a=+str_val;
												}
												
												if(type(num_a)!="NaN"){
													if(str_op_b=="lt"){
														q_a=num_a<val[0];
													}else if(str_op_b=="lte"){
														q_a=num_a<=val[0];
													}else if(str_op_b=="gt"){
														q_a=num_a>val[0];
													}else if(str_op_b=="gte"){
														q_a=num_a>=val[0];
													}
												}
												
												if(!q_a){
													q_valid=false;
												}
											}
										}
										
										if(!q_valid){
											arr_msg.push(str_msg);
										}
									});
									
									if(arr_msg.length>0){
										arr_fail.push([el_input].concat(arr_msg));
									}else{
										arr_success.push(el_input);
									}
								});
								
								if(arr_fail.length>0){
									map_fail[key]=arr_fail;
								}else{
									map_success[key]=arr_success;
								}
							}else{
								if(map_options.required){
									map_fail[key]=null;
								}
							}
						});
						
						if(!isEmpty(map_fail)){
							e.preventDefault();
							
							fn_fail(el_form, map_fail);
						}else{
							fn_success(el_form, map_success);
						}
					}, false);
				});
			});
		};
	
	/**
	 * object conf( [object options] )
	 */
	conf=function(map_options){
		map_options=map_options==null ? {} : map_options;
		
		merge(map_settings, map_options);
		
		return clone(map_settings);
	};
	
	/**
	 * void noop()
	 */
	noop=function(){};
	
	/**
	 * string type( mixed var )
	 */
	type=function(mix_a){
		return mix_a===null ? "null" : ((typeof mix_a=="number" && isNaN(mix_a)) ? "NaN" : typeof mix_a);
	};
	
	/**
	 * string trim( string string )
	 */
	trim=function(str_a){
		return str_a.replace(/^\s+|\s+$/g, "");
	};
	
	/**
	 * bool isArray( mixed var )
	 */
	isArray=function(mix_a){
		return Object.prototype.toString.apply(mix_a)=="[object Array]";
	};
	
	/**
	 * bool inArray( mixed needle, array haystack [, bool strict=false] )
	 */
	inArray=function(mix_needle, arr_haystack, q_strict){
		q_strict=q_strict==null ? false : q_strict;
		
		var q_found=false;
		
		each(arr_haystack, function(i, val){
			if(q_strict ? val===mix_needle : val==mix_needle){
				q_found=true;
				
				return false;
			}
		});
		
		return q_found;
	};
	
	/**
	 * bool isEmpty( object object )
	 *
	 * `object` should be a plain object, not an array.
	 */
	isEmpty=function(obj_a){
		var q_a=true;
		
		each(obj_a, function(){
			q_a=false;
			
			return false;
		});
		
		return q_a;
	};
	
	/**
	 * object newInstance( object instance )
	 */
	newInstance=function(mix_a){
		return new mix_a.constructor();
	};
	
	/**
	 * void each( object object, function iterate [, bool treatArrayAsObject=false] )
	 */
	each=function(obj_a, fn_a, q_forceObj){
		q_forceObj=q_forceObj==null ? false : q_forceObj;
		
		if(/**/"length" in obj_a && type(obj_a)!="function"/*/isArray(obj_a)/**/ && !q_forceObj){
			for(var i=0; i<obj_a.length; i++){
				if(fn_a(i, obj_a[i])===false){
					break;
				}
			}
		}else{
			for(var i in obj_a){
				if(fn_a(i, obj_a[i])===false){
					break;
				}
			}
		}
	};
	
	/**
	 * object merge( [int optionsIndex,] object target [, object object1 [, object ...]] )
	 *
	 * If `optionsIndex` is specified, the value of the argument at the specified index is used as the `options` object.
	 */
	merge=function(int_optionsIndex, map_target){
		var map_settings={
				"deep":false,
				
				/**
				 * "replace" (default): the array replaces the original one
				 * "merge": the array is treated as a general object
				 * "append": the array is appended to the end of the original one
				 * "combine": similar to "append" but appends only those values that aren't already in the original array (strict comparision)
				 *
				 * using a value different from "replace" is only possible when "deep" is set to `true`. otherwise "replace" is used.
				 * any other value than the values listed above is treated like "append" (if "deep" is set to `true`. otherwise this option defaults to "replace").
				 */
				"arrayMode":"replace"
			},
			args=Array.prototype.slice.apply(arguments);
		
		if(type(int_optionsIndex)!="object"){
			int_optionsIndex=(int_optionsIndex+arguments.length)%arguments.length;
			
			var map_options=args[int_optionsIndex];
			
			merge(map_settings, map_options);

			args.splice(int_optionsIndex, 1); //remove options object from arguments
			args.shift(); //remove index of options object (int_optionsIndex) from arguments
		}
		
		map_target=args.shift(); //remove target object (map_target) from arguments
		
		each(args, function(i, val){
			each(val, function(key, val){
				if(type(val)=="object"){
					if(type(map_target[key])!="object" || !map_settings.deep || isArray(val) && map_settings.arrayMode=="replace"){
						map_target[key]=newInstance(val);
					}else if(isArray(val) && map_settings.arrayMode!="merge"){
						var map_a={},
							int_a=0;
						
						each(val, function(i, val){
							if(map_settings.arrayMode!="combine" || !inArray(val, map_target[key], true)){
								map_a[map_target[key].length+int_a]=val;
								
								int_a++;
							}
						});
						
						val=map_a;
					}
					
					/**
					 * map_settings einfach weiterzureichen ist ein guter und einfacher weg
					 * (anstatt die "deep" option statisch auf `true` zu setzen und nur die
					 * restlichen optionen zu uebergeben), da ihr wert sowieso nur wirklich
					 * relevant ist wenn sie auch vorher auf `true` stand, da ansonsten
					 * das entsprechende item im target object zurueckgesetzt wird und es
					 * fuer die tiefer liegenden objects irrelevant ist ob "deep" auf `true`
					 * steht, da es sowieso nichts zum mergen gibt, da das item im
					 * target object ja leer ist.
					 */
					merge(1, map_settings, map_target[key], val);
				}else{
					map_target[key]=val;
				}
			});
		});
		
		return map_target;
	};
	
	/**
	 * object clone( object object )
	 */
	clone=function(obj_a){
		return merge({}, {
			"a":obj_a
		}).a;
	};
	
	/**
	 * array range( [number|string start,] number|string end [, number step] )
	 */
	range=function(mix_start, mix_end, int_step){
		mix_start=(type(mix_start)=="string" && mix_start.length>0) ? mix_start[0] : mix_start;
		mix_end=(type(mix_end)=="string" && mix_end.length>0) ? mix_end[0] : mix_end;
		int_step=(int_step==null || int_step==0) ? 1 : int_step;
		
		if(arguments.length==1){
			mix_end=mix_start;
			mix_start=null;
		}
		
		var q_str=type(mix_end)=="string";
		
		if(q_str){
			mix_start=type(mix_start)!="string" ? "" : mix_start;
			
			if(mix_end.match(/[a-z0-9]/i)==null){
				mix_end="z";
			}
			
			if(mix_end.match(/[a-z]/i)!=null && mix_start.match(/[a-z]/i)==null){
				mix_start="a";
			}else if(mix_end.match(/\d/)!=null && mix_start.match(/\d/)==null){
				mix_start="0";
			}
			
			mix_start=mix_start[mix_end==mix_end.toUpperCase() ? "toUpperCase" : "toLowerCase"]();
			mix_start=mix_start.charCodeAt(0);
			mix_end=mix_end.charCodeAt(0);
		}else{
			mix_start=type(mix_start)!="number" ? 0 : mix_start;
		}
		
		var arr_range=[];
		
		for(var i=mix_start; int_step<0 ? i>=mix_end : i<=mix_end; i+=int_step){
			arr_range.push(q_str ? String.fromCharCode(i) : i);
		}
		
		return arr_range;
	};
	
	var args_b=Array.prototype.slice.apply(arguments);
	
	each(args, function(i, val){
		validate[val]=args_b[i+(args_b.length-args.length)];
	});
	
	win.validate=validate;
})(window, document, "conf", "noop", "type", "trim", "isArray", "isEmpty", "inArray", "newInstance", "each", "merge", "clone", "range");
