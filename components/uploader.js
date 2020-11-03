import { ToastContainer, toast } from "react-toastify";
import AwsS3 from "@uppy/aws-s3";
import DashboardModal from "@uppy/react/lib/DashboardModal";
import PropTypes from "prop-types";
import uppy from "@uppy/core";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import "react-toastify/dist/ReactToastify.css";

function UppyModal({ open, onClose }) {
  const notify = () =>
    toast(
      "Images uploaded with success! In a few seconds, they will appear in the list below and be searchable."
    );
  const uppyInstance = uppy({
    allowMultipleUploads: true,
    restrictions: {
      maxNumberOfFiles: 5,
      allowedFileTypes: ["image/*"],
    },
  })
    .use(AwsS3, {
      getUploadParameters(file) {
        return fetch("/api/upload", {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            filename: file.name,
            contentType: file.type,
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            return {
              method: data.method,
              url: data.url,
              fields: data.fields,
              headers: data.headers,
            };
          });
      },
    })
    .on("complete", () => {
      notify();
      onClose();
    });

  return (
    <>
      <DashboardModal
        hidePauseResumeButton
        closeModalOnClickOutside
        proudlyDisplayPoweredByUppy={false}
        uppy={uppyInstance}
        open={open}
        onRequestClose={onClose}
      />
      <ToastContainer />
    </>
  );
}

UppyModal.defaultProps = {
  open: false,
  onClose: null,
};

UppyModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

export default UppyModal;
