<?php
/* Functions general to all projects */

function redirect_to($location=NULL){
  if($location != NULL){
    header("Location: {$location}");
    exit;
  }
}

function confirm_query($result){
  global $con;
	if(!$result){
	die("Database query failed: ". mysqli_error($con));
	}
}
function selectSingleRecord($table, $column="*", $where_clause=1){
  global $pdo;
  $sql = "SELECT $column FROM $table WHERE $where_clause LIMIT 1";
  $stmt = $pdo->prepare($sql);
  $stmt ->execute();
  $row = $stmt->fetch();
  return $row ? $row : false;
}

function selectRecords($table, $column="*", $where_clause=1){
  global $pdo;
  $sql = "SELECT $column FROM $table WHERE $where_clause ";
  $stmt = $pdo->prepare($sql);
  $stmt ->execute();
  $row = $stmt->fetchAll();
  return $row ? $row : [];
}

function selectQuestions($table, $column="*", $where_clause=1){
  global $pdo;
  $sql = "SELECT $column FROM $table WHERE $where_clause ";
  $stmt = $pdo->prepare($sql);
  $stmt ->execute();
    $result = [];
  while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
    $row['questn'] = json_decode($row['questn']);
    $result[] = $row;
  }

  return $result;
}

function selectAnswers($table, $column="*", $where_clause=1){
  global $pdo;
  $sql = "SELECT $column FROM $table WHERE $where_clause ";
  $stmt = $pdo->prepare($sql);
  $stmt ->execute();
    $result = [];
  while($row = $stmt->fetch(PDO::FETCH_ASSOC)){
    $row['answers'] = json_decode($row['answers']);
    $result[] = $row;
  }

  return $result;
}

function insertRecord($table, $column, $value){
  global $con;
  $query ="INSERT INTO $table($column) VALUES $value ";
  $result = mysqli_query($con,$query);
  confirm_query($result);
  return $result ? true: false; 
}

function insertSelectRecord($table1, $table2 , $column, $where_clause){
  global $con;
  $query ="INSERT INTO $table1($column) SELECT $column FROM $table2 WHERE $where_clause ";
  $result = mysqli_query($con,$query);
  confirm_query($result);	
  return $result ? true: false; 
}

function updateRecord($table, $column, $where_clause){
  global $con;
  $query = "UPDATE $table SET $column WHERE $where_clause ";
  $result = mysqli_query($con,$query);
  confirm_query($result);
  return mysqli_affected_rows($con);	
}

function deleteRecord($table, $where_clause){
  global $con;
  $query = "DELETE FROM $table WHERE $where_clause LIMIT 1 ";
  $result = mysqli_query($con,$query);
  confirm_query($result);
  return mysqli_affected_rows($con);
}

function truncateRecord($table){
  global $con;
  $query = "TRUNCATE TABLE $table";
  $result = mysqli_query($con,$query);
  confirm_query($result);
  return true;
}

/* Functions Specific to this project */
// Questions
function updateQuestions($data, $table){
  $questions = $data->questions;
  $type = $data->type;
  $qtype = $data->qtype;
  $total = count($questions);
  switch ($type) {
    case 'update':
      if($total){
        updateRecord($table,"active=0", 1 );
        foreach ($questions as $q) {
          $id = $q->qid;
          updateRecord($table, "active=1", "qid='{$id}'");
        }
        $res = true;
      }else {
        $res = updateRecord($table,"active=0", 1 );
      }
      break;
    case 'delete':
      if($total){
        foreach ($questions as $q) {
          $id = $q->qid;
          deleteRecord($table, "qid='{$id}'");
          $qtype == 'pic' ? unlink('../' . $q->picture): '';
        }
        $res = true;
      }
      break;
    case 'deleteAll':     
      if($qtype === 'pic'){
        $records = SelectRecords($table);
      foreach ($records as $q) {
          unlink('../' . $q->picture);
        }
      }
      $res = truncateRecord($table);
      break;			
    default:			
      break;
  }
  return $res ? json_encode(selectQuestions($table, '*', "1 ORDER BY created_on DESC")) : '';
}

function postQuestions($data, $table){
  global $con;
  $id = $data->qid;
  $questn = mysqli_real_escape_string($con, json_encode($data->questn));
  $questn_type = $data->questn_type;
  $active = $data->active;
  $dept_id = $data->dept_id;
  if($id){
    $column = "questn='{$questn}', active={$active}";
    $where_clause = "qid='{$id}'";
    $res = updateRecord($table, $column, $where_clause);
  } else{
    $column = "qid, dept_id, questn, questn_type, active";
    $value = "(uuid(),'$dept_id','$questn','$questn_type', $active)";
    $res = insertRecord($table, $column, $value);
  }
  return $res ? json_encode(selectQuestions($table, '*', "1 ORDER BY created_on DESC")) : '';
}

//Answers
function postAnswers($data, $table){
  $user_id = $data->userId;
  $setup_id = $data->setupId;
  $questn_type = $data->questnType;
  $answers = $data->ans;
  //Differences btw bop & tof: (*5)
  $questns_total = $questn_type == 'bop' ? (int)$data->questnsTotal : (int)$data->questnsTotal * 5;
  $questns_answered = count($answers);
  $questns_unanswered = $questns_total - $questns_answered;
  $questns_passed = 0;
  $questns_failed = 0;
  
  //Differences btw bop & tof: ans->value == 1 and ans->value == ans->ca
  if($questn_type == 'bop'){
    foreach($answers as $ans){			
      $ans->value == 1 ? $questns_passed += 1 : $questns_failed += 1;
    }
  } else{
    foreach($answers as $ans){
      $ans->value == $ans->ca ? $questns_passed += 1 : $questns_failed += 1; 
    }
  }

  $setup = selectSingleRecord("setup", "negative_marking, pass_mark", "setup_id='{$setup_id}' and active=1");
  if($setup){
    $negative_marking = $setup->negative_marking;
    $pass_mark = $setup->pass_mark;
  } else{
    $negative_marking = 0;
    $pass_mark = 50;
  }
  $initial_score = $questns_passed - ($questns_failed * $negative_marking); 
  $final_score = ($initial_score / $questns_total) * 100;
  if($final_score >= $pass_mark){
    $pass =  1 ;
  } else{
    $pass =  0 ;
  }
  $initial_score = floatval(number_format($initial_score, 2));    
  $final_score = floatval(number_format($final_score, 2));   
  $answers  = json_encode($answers);
  $col = " ans_id, questn_type, user_id, setup_id, questns_total, questns_answered, questns_unanswered, questns_passed, questns_failed, initial_score, final_score, pass, answers ";
  $val = "(uuid(), '{$questn_type}', '{$user_id}', '{$setup_id}', {$questns_total}, {$questns_answered}, {$questns_unanswered}, {$questns_passed}, {$questns_failed}, {$initial_score}, {$final_score}, {$pass},'{$answers}')";

  $result = insertRecord($table, $col, $val); 
  
  return $result ? json_encode(['submit' => 1]) : json_encode(['submit' => 0]);
}

function updateAnswers($data, $table){
  $id = $data->ans_id;
  $questns_total = $data->questns_total;
  $questns_answered = $data->questns_answered;
  $questns_unanswered = $data->questns_unanswered;
  $questns_passed = $data->questns_passed;
  $questns_failed = $data->questns_failed;
  $initial_score = $data->initial_score; 
  $final_score = $data->final_score;
  $pass =  $data->pass; 
  $column = " questns_total={$questns_total}, questns_answered={$questns_answered}, questns_unanswered={$questns_unanswered}, questns_passed={$questns_passed}, questns_failed={$questns_failed}, initial_score={$initial_score}, final_score={$final_score}, pass={$pass} ";
  $where_clause = "ans_id='{$id}'";
  $res = updateRecord($table, $column, $where_clause);
  return $res ? json_encode(selectAnswers($table)): '';
}


// File Uploads
function upload_file($image_name = '', $tmp_dir = '', $dept_id='', $picture=''){
  $dept_filename = selectSingleRecord('departments', 'dept_filename', "dept_id='{$dept_id}'")->dept_filename;
  $upload_path='../_uploads/' . $dept_filename . '/';
  $upload_dir = '_uploads/' . $dept_filename . '/';
  $extension = pathinfo($image_name, PATHINFO_EXTENSION);
  $filepath = $upload_path . time() . '.' . $extension;
  $filename = $upload_dir . time() . '.' . $extension;
  $picture ? unlink('../'. $picture) : '';		
  if(move_uploaded_file($tmp_dir, $filepath)){
    return $filename;
  }
}
?>
