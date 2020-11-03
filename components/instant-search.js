import clsx from "clsx";
import PropTypes from "prop-types";
import React, { useState } from "react";
import Uppy from "components/uploader";
import {
  connectSearchBox,
  connectInfiniteHits,
  Configure,
  InstantSearch,
} from "react-instantsearch-dom";

export const HitComponent = ({ hit }) => {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <img
        className="h-64 w-full object-cover"
        src={`/images/${hit?.objectID}`}
        alt={hit.display_name}
      />
      <div className="px-6 pt-4 pb-2">
        <h3 className="font-bold text-md mb-4">Detected labels</h3>
        {hit?.detectedLabels?.map((label) => (
          <span
            key={label.Name}
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
          >
            {label.Name}
          </span>
        ))}
      </div>
    </div>
  );
};

HitComponent.propTypes = {
  hit: PropTypes.object,
};

const Hits = ({ hits, hasMore, refineNext }) => {
  if (hits?.length === 0) {
    return (
      <h2 className="text-2xl font-black">
        Oops! No labels match your criteria...
      </h2>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {hits.map((hit) => (
        <HitComponent key={`${hit.imageUrl}`} hit={hit} />
      ))}

      <div className="col-span-2 md:col-span-3">
        <button
          disabled={!hasMore}
          className={clsx(
            "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full",
            !hasMore && "cursor-not-allowed opacity-50"
          )}
          onClick={refineNext}
        >
          Load more
        </button>
      </div>
    </div>
  );
};

const CustomHits = connectInfiniteHits(Hits);

const SearchBox = ({ currentRefinement, refine }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <div className="flex flex-wrap">
      <div className="w-full">
        <h1 className="font-black text-3xl ">Search images demo app</h1>
        <p className="text-gray-700 mb-4">
          Powered by{" "}
          <a
            className="text-blue-700"
            href="https://www.koyeb.com"
            target="_blank"
            rel="noopener"
          >
            Koyeb
          </a>
          . Checkout the complete tutorial{" "}
          <a
            className="text-blue-700"
            href="https://www.koyeb.com/tutorials/image-search-app-with-koyeb-aws-rekognition-and-algolia"
            target="_blank"
            rel="noopener"
          >
            here
          </a>
          .
        </p>
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3">
            <input
              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              value={currentRefinement}
              type="text"
              onChange={(e) => refine(e.currentTarget.value)}
            />
          </div>
          <div className="col-span-auto">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
      <Uppy
        open={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

const CustomSearchBox = connectSearchBox(SearchBox);

export default class extends React.Component {
  static propTypes = {
    searchState: PropTypes.object,
    resultsState: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    onSearchStateChange: PropTypes.func,
    createURL: PropTypes.func,
    indexName: PropTypes.string,
    searchClient: PropTypes.object,
  };

  render() {
    return (
      <InstantSearch
        searchClient={this.props.searchClient}
        resultsState={this.props.resultsState}
        searchState={this.props.searchState}
        createURL={this.props.createURL}
        indexName={this.props.indexName}
        onSearchStateChange={this.props.onSearchStateChangse}
        {...this.props}
      >
        <Configure hitsPerPage={100} />
        <div className="container mx-auto my-8 p-2">
          <div className="grid grid-cols-4">
            <div className="col-span-4">
              <CustomSearchBox />
              <CustomHits minHitsPerPage={100} />
            </div>
          </div>
        </div>
      </InstantSearch>
    );
  }
}
