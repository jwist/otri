<?php
include 'PDFMerger.php';

$patentId = $_REQUEST['patent_id'];

$pdf = new PDFMerger;

$patentsResponse = file_get_contents('https://patentes-e137b.firebaseio.com/patents.json');
$patents = json_decode($patentsResponse, true);

$patent = $patents[$patentId];

$index = 1;
foreach($patent["documents"] as $patentDocument){
    $dest = $patentId."-".$index;
    copy($patentDocument["url"], $dest);
    $pdf->addPDF($dest, 'all');
    $index++;
}

$pdf->merge('download', 'files/export-'.$patentId.".pdf");

?>