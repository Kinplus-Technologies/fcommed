<?php 
require_once('initialize.php');

$method = $_SERVER['REQUEST_METHOD'];
$table = 'questns_pic';
$res = '';

switch($method){
	case 'GET':
		$u = $_GET['_u'] ;
		if($u==1){
			echo json_encode(selectQuestions($table, '*', "active=1"));
		} else if($u==2){
			echo json_encode(selectQuestions($table, '*', "1 ORDER BY created_on DESC"));
		}
		break;
	case 'POST':
		$questn = mysqli_real_escape_string($con, $_POST['questn']);
		$file = isset($_FILES['file']['name']);
		$id = $_POST['qid'];
		$questn_type = $_POST['questn_type'];
		$active = (int)$_POST['active'];
		$dept_id = $_POST['dept_id'];
		$res = '';
		if($id){
			if($file){
				$picture = upload_file($_FILES['file']['name'], $_FILES['file']['tmp_name'], $dept_id, $_POST['picture']);
				$column = "questn='{$questn}', picture='{$picture}', active={$active}" ;
			} else {
				$column = "questn='{$questn}', active={$active}" ;
			}
			$where_clause = "qid='{$id}'";
			$res = updateRecord($table, $column, $where_clause);
		} else{
			$picture = upload_file($_FILES['file']['name'], $_FILES['file']['tmp_name'], $dept_id);
			if($picture){
				$column = "qid, dept_id, questn, questn_type, picture,  active";
				$value = "(uuid(),'$dept_id','$questn','$questn_type', '$picture',  $active)";
				$res = insertRecord($table, $column, $value);
			} 
		}
		echo $res ? json_encode(selectQuestions($table, '*', "1 ORDER BY created_on DESC")) : '';
		break;
	case 'PUT': 
		$data = json_decode(file_get_contents("php://input")); // Get raw posted data
		echo updateQuestions($data, $table);
		break;	
	case 'DELETE':		
		$id = $_SERVER['QUERY_STRING'];
		$picture = selectSingleRecord($table, 'picture', "qid='{$id}'")->picture;
		$picture ? unlink('../' . $picture ) : '';
		$res = deleteRecord($table, "qid='{$id}'") ;
		echo $res ? json_encode(selectQuestions($table, '*', "1 ORDER BY created_on DESC")) : '';
		break;
	default:
		break;
}

?>