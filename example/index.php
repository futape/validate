<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Validate Example</title>
        <style>
			.validate {
				color:red;
			}
			.validate.valid {
				color:green;
			}
		</style>
    </head>
    <body>
		<h1>User information</h1><?php
		
		if($_SERVER['REQUEST_METHOD']=="POST"){
			include_once("../validate.php");
			
			if(validate("main.js", $arr_result)){ ?>
				<p class="validate valid">User information were submitted successfully.</p><?php
			}else{ ?>
				<p class="validate">User information couldn't be submitted due to invalidity.</p><?php
				
				foreach($arr_result as $key=>$val){
                	echo '<p class="validate">'.htmlspecialchars($key).':';
					
					if(is_null($val)){
						echo '<br />The field is missing.';
					}else{
						foreach($val as $val_b){
							echo '<br />'.htmlspecialchars($val);
						}
					}
					
					echo '</p>';
				}
			}
		} ?>
        
    	<form method="post">
        	<input type="hidden" name="user_form" /><!-- form identifier -->
        	
        	<div>
            	<label for="name">Name:</label>
                <input type="text" name="name" id="name" />
            </div>
            <div>
                <label for="country">Land:</label>
                <select name="country" id="country">
                    <option value="us">USA</option>
                    <option value="fr">France</option>
                    <option value="de">Germany</option>
                </select>
            </div>
            <div>
                <label for="birth">Birthday:</label>
                <input type="text" name="birth" id="birth" /> (DD.MM.YYYY)
            </div>
            <div>
                <label for="age">Age:</label>
                <input type="text" name="age" id="age" />
            </div>
            <div>
                <label for="key">Key:</label>
                <input type="password" name="key" id="key" />
            </div>
            
            <div>
            	<input type="submit" value="Send information" />
            </div>
        </form>
        
        <script src="../validate.js"></script>
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js"></script>
        <script src="main.js"></script>
    </body>
</html>
