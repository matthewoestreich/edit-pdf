const { PDFDocument, rgb } = PDFLib;
const file = document.querySelector("#file");
const submit = document.querySelector("#submit");
const loadSample = document.querySelector("#load-pdf");
const uploadedFileName = document.querySelector("#uploaded-file-name");
const status = document.querySelector("#status");

file.addEventListener("change", (e) => {
  if (file.files && file.files.length) {
    uploadedFileName.innerHTML = `Uploaded File: <b>${file.files[0].name}</b>`;
  } else {
    uploadedFileName.innerHTML = "";
  }
})

submit.addEventListener("click", handleSubmit);

loadSample.addEventListener("click", async (e) => {
  await handleLoadSamplePDF("/edit-pdf/sample.pdf");
});

/**
 * For loading sample file from repo
 */

async function handleLoadSamplePDF(url) {
  const designFile = await createFile(url);
  const dt = new DataTransfer();
  dt.items.add(designFile);
  file.files = dt.files;
  const event = new Event("change", { bubbles: !0 });
  file.dispatchEvent(event);
}

async function createFile(url) {
  const response = await fetch(url);
  const data = await response.blob();
  const metadata = { type: "application/pdf" };
  return new File([data], "sample.pdf", metadata);
}

/**
 * For manual file upload
 */

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
  try {
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
  } catch (err) {
    status.innerHTML = `Error! : ${err.message}`;
  }
}
