import React, { Component } from 'react';
import axios from 'axios';

const axiosGitHubGraphQL = axios.create({
  baseURL: 'https://api.github.com/graphql',
  headers: {
    Authorization: `bearer ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`
  }
});

const GET_ISSUES_OF_REPOSITORY = `

  query ($organization: String!, $repository: String!) {
    organization(login: $organization) {
      name
      url
      repository(name: $repository) {
        name
        url
        issues(last: 5) {
          edges {
            node {
              id
              title
              url
            }
          }
        }
      }
    }
  }

`;

const getIssuesOfRepository = path => {
  const [organization, repository] = path.split('/');
  return  axiosGitHubGraphQL
            .post('', { 
              query: GET_ISSUES_OF_REPOSITORY,
              variables: { organization, repository} 
            });
}

const resolveIssuesQuery = queryResult => () => {
  console.log(`resolveIssuesQuery... organization = ${queryResult.data.data.organization}`);
  return {
    organization: queryResult.data.data.organization,
    errors: queryResult.data.errors,
  }
}

const TITLE = 'React GraphQL GitHub Client';

class App extends Component {

  state = {
    path: 'the-road-to-learn-react/the-road-to-learn-react',
    organization: null,
    errors: null,
  };

  componentDidMount() {
    this.onFetchFromGitHub(this.state.path);
  }

  onChange = event => {
    this.setState({ path: event.target.value});
  }

  onSubmit = event => {
    // fetch data
    this.onFetchFromGitHub(this.state.path);

    event.preventDefault();
  }

  onFetchFromGitHub = path => {
    console.log(`Entering onFetch, state = ${JSON.stringify(this.state)}`);
    getIssuesOfRepository(path).then(queryResult => {
      console.log(`queryResult = ${JSON.stringify(queryResult)}`);
      this.setState(resolveIssuesQuery(queryResult))
      console.log(`this.state = ${JSON.stringify(this.state)}`);
    })
  }

  render() {
    //console.log(`Access Token = ${process.env.REACT_APP_GITHUB_PERSONAL_ACCESS_TOKEN}`)

    const { path, organization, errors } = this.state;

    return (
      <div>
        <h1>{TITLE}</h1>

        <form onSubmit={this.onSubmit}>
          <label htmlFor="url">
            Show open issues for https://github.com/
          </label>
          <input
            id="url"
            type="text"
            value={path}
            onChange={this.onChange}
            style={{ width: '300px' }}
          />
          <button type="submit">Search</button>
        </form>

        <hr />

        {/* Here comes the result... */}

        {organization ? (
          <Organization organization={organization} errors={errors} />
        ) : (
          <p>No information yet...</p>
        )}
        
      </div>
    );
  }
}

const Organization = ({ organization, errors }) => {
  if (errors) {
    return (
      <p>
        <strong>Something went wrong:</strong>
        {errors.map(error => error.message).join(' ')}
      </p>
    );
  }

  return (
  <div>
    <p>
      <strong>Issues from Organization:</strong>
      <a href={organization.url}>{organization.name}</a>
    </p>
    <Repository repository={organization.repository} />
  </div>
  );
}

const Repository = ({ repository }) => (
  <div>
    <p>
      <strong>In Repository:</strong>
      <a href={repository.url}>{repository.name}</a>
    </p>

    <ul>
      {repository.issues.edges.map(issue => (
        <li key={issue.node.id}>
          <a href={issue.node.url}>{issue.node.title}</a>
        </li>
      ))}
    </ul>
  </div>
)

export default App;