const { PDFDocument, rgb } = PDFLib;
const file = document.querySelector("#file");
const form = document.querySelector("#upload");
const status = document.querySelector("#status");

form.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();

  const fileList = file.files;
  const fileReader = new FileReader();

  if (fileReader && fileList && fileList.length) {
    fileReader.readAsArrayBuffer(fileList[0]);
    fileReader.onload = async function () {
      const data = fileReader.result;
      await modifyPdf(data, fileList[0].name);
    };
  } else {
    alert("No file uploaded. Please upload a file first!");
  }
}

async function modifyPdf(pdfAsArrayBuffer, pdfName = "MyPDF") {
  status.innerHTML = "Working..."; // update status

  const existingPdfBytes = pdfAsArrayBuffer;
  // Load a PDFDocument from the existing PDF bytes
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();

    page.drawLine({
      start: { x: 0, y: height },
      end: { x: width, y: 0 },
      thickness: 5,
      color: rgb(0, 0, 0),
      //opacity: 0.75,
    });
  });

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // Downlad modified PDF
  const blob = new Blob([pdfBytes]);
  const alink = document.createElement("a");
  alink.href = window.URL.createObjectURL(blob);
  alink.download = pdfName;
  alink.click();

  status.innerHTML = "Done!";
}
