<?php 
require_once('initialize.php');

$method = $_SERVER['REQUEST_METHOD'];

switch($method){
	case 'GET': 
		echo json_encode(SelectRecords('instructions'));
		break;
	case 'POST': 
		$data = json_decode(file_get_contents("php://input")); // Get raw posted data
		$id = $data->id;
		$instruction = mysqli_real_escape_string($con, $data->instruction);
		$user_see_result = $data->user_see_result;
		$user_see_analysis = $data->user_see_analysis;
		$table = "instructions";		
		$column = "instruction='{$instruction}', user_see_result={$user_see_result}, user_see_analysis={$user_see_analysis}";
			$where_clause = "id='{$id}'";
			$res = updateRecord($table, $column, $where_clause);		
		echo $res ? json_encode(SelectRecords('instructions')) : '';
		break;	
	default:
		break;
}

?>