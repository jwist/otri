<?php

$patentId = $_REQUEST['patent_id'];

$patentsResponse = file_get_contents('https://patentes-e137b.firebaseio.com/patents.json');
$patents = json_decode($patentsResponse, true);

$patent = $patents[$patentId];
$patentDocument = $patent["documents"][0];
$dest = "files/patent.pdf";

copy($patentDocument["url"], $dest);
    
header("Content-type:application/pdf");
header("Content-Disposition:attachment;filename='patent.pdf'");

readfile($dest);

?>