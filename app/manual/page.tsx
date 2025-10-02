import ManualInstructions from "./ManualInstructions";

type ManualCallbackPageProps = {
  searchParams: {
    code?: string;
  };
};

export default function ManualCallbackPage({ searchParams }: ManualCallbackPageProps) {
  const code = (searchParams.code ?? "").trim();
  return <ManualInstructions code={code} />;
}
