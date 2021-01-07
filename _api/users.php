<?php 
require_once('initialize.php');

$method = $_SERVER['REQUEST_METHOD'];
$table = "users";

switch($method){
	case 'GET': 
		echo json_encode(SelectRecords($table, '*', "1 ORDER BY last_name"));
		break;
	case 'POST': 
		$data = json_decode(file_get_contents("php://input")); // Get raw posted data
		$id = $data->user_id;
		$last_name = mysqli_real_escape_string($con, $data->last_name);
		$first_name = mysqli_real_escape_string($con, $data->first_name);
		$mid_name = mysqli_real_escape_string($con, $data->mid_name);
		$reg_num = mysqli_real_escape_string($con, $data->reg_num);
		$passwd = mysqli_real_escape_string($con, $data->passwd);
		$active = $data->active;
		$is_admin = $data->is_admin;
		$dept_id = $data->dept_id;		
		if($id){
			$column = "first_name='{$first_name}', last_name='{$last_name}', mid_name='{$mid_name}', reg_num='{$reg_num}', passwd='{$passwd}', active={$active}";
			$where_clause = "user_id='{$id}'";
			$res = updateRecord($table, $column, $where_clause);
		} else{
			$column = "user_id, dept_id, first_name, last_name, mid_name, reg_num, passwd, active, is_admin";
			$value = "(uuid(),'$dept_id','$first_name','$last_name', '$mid_name','$reg_num','$passwd',$active, $is_admin)";
			$res = insertRecord($table, $column, $value);
		}
		echo $res ? json_encode(SelectRecords($table, '*', "1 ORDER BY last_name")) : '';
		break;
	case 'DELETE':		
		$id = $_SERVER['QUERY_STRING'];
		$res = deleteRecord($table, "user_id='{$id}'") ;
		echo $res ? json_encode(SelectRecords($table, '*', "1 ORDER BY last_name")) : '';
		break;
	default:
		break;
}
?>