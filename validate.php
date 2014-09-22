<?php
	/**
	 * array validate_conf( [array $options] )
	 */
	function validate_conf($arr_options=array()){
		static $arr_settings=array(
			"trim"=>true,
			"required"=>true,
			"test"=>array()
		);
		
		$arr_settings=array_merge($arr_settings, $arr_options);
		
		return $arr_settings;
	}
	
	/**
	 * bool validate( array|string $test_or_file [, array &$result [, string &$form [, string $request_method=null]]] )
	 *
	 * If `$test_or_file` is a string, the function assumes that it's a path and trys to read the string it is pointing on. The content is searched for a JSON-compliant object enclosed by */
    // `/*!#validate*/` and `/*!#/validate*/`
    /* that is parsed and used as the test array.
	 *
	 * If `$request_method` is set to `null` (which is the default value), `strtolower($_SERVER["REQUEST_METHOD"])` is used instead.
	 * If the final value for `$request_method` is `"get"`, the function uses `$_GET` for retrieving the request data. Otherwise `$_POST` is used.
	 */
	function validate($arr_test, &$arr_result=null, &$str_form=null, $str_method=null){
		if(is_string($arr_test)){
			if(preg_match('/\/\*!#validate\*\/(.+)\/\*!#\/validate\*\//s', file_get_contents($arr_test), $arr_match)==1){ //file must be utf8 encoded
				$arr_test=json_decode($arr_match[1], true);
			}
		}
		
		$str_method=is_null($str_method) ? strtolower($_SERVER["REQUEST_METHOD"]) : $str_method;
		
		$arr_settings=validate_conf();
		$arr_req=$str_method=="get" ? $_GET : $_POST;
		$str_form=array_shift(array_keys(array_intersect_key($arr_test, $arr_req)));
		
		if(is_null($str_form)){
			return null;
		}
		
		$arr_fields=$arr_test[$str_form];
		$arr_fail=array();
		$arr_success=array();
		
		foreach($arr_fields as $str_field=>$val){
			$arr_options=array_merge($arr_settings, $val);
			
			if(array_key_exists($str_field, $arr_req)){
				$mix_val=$arr_req[$str_field];
				$arr_fail_b=array();
				$int_success=0;
				
				foreach(is_array($mix_val) ? $mix_val : array($mix_val) as $val){
					$str_val=$arr_options["trim"] ? trim($val) : $val;
					$arr_msg=array();
					
					foreach($arr_options["test"] as $val){
						$str_op=array_shift($val);
						$str_msg=array_pop($val);
						$q_valid=true;
						
						if($str_op=="match"){
							$re_match='/'.$val[0].'/'.$val[1];
							
							if(preg_match($re_match, $str_val)!=1){
								$q_valid=false;
							}
						}else if($str_op=="range"){
							$arr_range=is_array($val[0]) ? $val[0] : call_user_func_array("range", $val);
							
							if(!in_array($str_val, $arr_range)){
								$q_valid=false;
							}
						}else if($str_op=="eq" || $str_op=="length"){
							$mix_val;
							
							if($str_op=="length"){
								$mix_val=strlen($str_val);
							}else{
								$mix_val=$str_val;
							}
							
							if($mix_val!=$val[0]){
								$q_valid=false;
							}
						}else if(preg_match('/^(?:(length)-)?([lg]te?)$/', $str_op, $arr_match)==1){
							$q_a=false;
							$str_op_b=$arr_match[2];
							$num_a;
							
							if($arr_match[1]=="length"){ //if no prefix ("length" for example) was found, `$arr_match[1]` will be `""`
								$num_a=strlen($str_val);
							}else{
								$num_a=(float)$str_val;
							}
							
							if($str_op_b=="lt"){
								$q_a=$num_a<$val[0];
							}else if($str_op_b=="lte"){
								$q_a=$num_a<=$val[0];
							}else if($str_op_b=="gt"){
								$q_a=$num_a>$val[0];
							}else if($str_op_b=="gte"){
								$q_a=$num_a>=$val[0];
							}
							
							if(!$q_a){
								$q_valid=false;
							}
						}
						
						if(!$q_valid){
							array_push($arr_msg, $str_msg);
						}
					}
					
					if(count($arr_msg)>0){
						array_push($arr_fail_b, $arr_msg);
					}else{
						$int_success++;
					}
				}
				
				if(count($arr_fail_b)>0){
					$arr_fail[$str_field]=$arr_fail_b;
				}else{
					$arr_success[$str_field]=$int_success;
				}
			}else{
				if($arr_options["required"]){
					$arr_fail[$str_field]=null;
				}
			}
		}
		
		$q_success=count($arr_fail)==0;
		
		if(!$q_success){
			$arr_result=$arr_fail;
		}else{
			$arr_result=$arr_success;
		}
		
		return $q_success;
	}
?>
