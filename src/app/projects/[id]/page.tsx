import React from "react";

const Project = ({ params }: { params: { id: string } }) => {
  return <p>Post: {params.id}</p>;
};

export default Project;
