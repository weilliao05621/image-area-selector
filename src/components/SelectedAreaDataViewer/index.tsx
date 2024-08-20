// store
import useSelectionStore from "@/stores/selection/index.store";

// components
import JsonViewer from "./JsonViewer";

function SelectedAreaDataViewer() {
  const { getPreviewDataList } = useSelectionStore();
  const previewData = getPreviewDataList();

  return <JsonViewer data={previewData} hideEmptyContent />;
}

export default SelectedAreaDataViewer;
