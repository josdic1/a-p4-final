import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [categories, setCategories] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')

  // Form states
  const [recipeName, setRecipeName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showExtendedRecipes, setShowExtendedRecipes] = useState(false)
  const [showExtendedCategory, setShowExtendedCategory] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState(null)
  const [editRecipeName, setEditRecipeName] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const response = await fetch('http://localhost:5555/check_session', {
      credentials: 'include'
    })
    const data = await response.json()
    if (data.logged_in) {
      setLoggedIn(true)
      setCurrentUser(data.username)
      fetchRecipes()
      fetchCategories()
    }
  }

  const handleRegister = async (e) => {
  e.preventDefault()
  
  const response = await fetch('http://localhost:5555/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  })
  
  const data = await response.json()
  setMessage(data.message)
  
  if (response.ok) {
    checkSession()
  }
}

  const fetchRecipes = async () => {
    const response = await fetch('http://localhost:5555/recipes', {
      credentials: 'include'
    })
    const data = await response.json()
    setRecipes(data)
  }

  const fetchCategories = async () => {
    const response = await fetch('http://localhost:5555/categories', {
      credentials: 'include'
    })
    const data = await response.json()
    setCategories(data)
  }

  const handleLogin = async (e) => {
    e.preventDefault()

    const response = await fetch('http://localhost:5555/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    })

    const data = await response.json()
    setMessage(data.message)

    if (response.ok) {
      checkSession()
    }
  }

  const handleLogout = async () => {
    await fetch('http://localhost:5555/logout', {
      method: 'POST',
      credentials: 'include'
    })
    setLoggedIn(false)
    setCurrentUser(null)
    setRecipes([])
  }

  const handleAddRecipe = async (e) => {
    e.preventDefault()

    const response = await fetch('http://localhost:5555/add_recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: recipeName,
        category_id: selectedCategory
      })
    })

    if (response.ok) {
      setRecipeName('')
      setSelectedCategory('')
      fetchRecipes()
    }
  }

const handleDeleteRecipe = async (recipeId) => {
  const response = await fetch(`http://localhost:5555/recipe/${recipeId}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  
  if (response.ok) {
    fetchRecipes()
  }
}

const handleUpdateRecipe = async (recipeId) => {
  await fetch(`http://localhost:5555/recipe/${recipeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      name: editRecipeName,
      category_id: editCategoryId
    })
  })
  setEditingRecipe(null)
  fetchRecipes()
}

  const handleAddCategory = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post('http://localhost:5555/add_category',
        { name: newCategoryName },
        { withCredentials: true }
      )

      setNewCategoryName('')
      await fetchCategories()
      
      // Auto-select the new category if ID is returned
      if (response.data.id) {
        setSelectedCategory(response.data.id.toString())
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }
  
  const onAutologin = () => {
    setUsername('josh')
    setPassword('josh123')
  }

  const getMyRecipes = async () => {
    const response = await fetch('http://localhost:5555/my_recipes', {
      credentials: 'include'
    })
    const data = await response.json()
    setRecipes(data)
  }

  const getNotMyRecipes = async () => {
    const response = await fetch('http://localhost:5555/not_my_recipes', {
      credentials: 'include'
    })
    const data = await response.json()
    setRecipes(data)
  }

  const showAllRecipes = async () => {
    const response = await fetch('http://localhost:5555/recipes', {
      credentials: 'include'
    })
    const data = await response.json()
    setRecipes(data)
  }

  const getMyCategories = async () => {
    const response = await fetch('http://localhost:5555/my_categories', {
      credentials: 'include'
    })
    const data = await response.json()
    setCategories(data)
  }

  const getNotMyCategories = async () => {
    const response = await fetch('http://localhost:5555/not_my_categories', {
      credentials: 'include'
    })
    const data = await response.json()
    setCategories(data)
  }

  const showAllCategories = async () => {
    const response = await fetch('http://localhost:5555/categories', {
      credentials: 'include'
    })
    const data = await response.json()
    setCategories(data)
  }

  const extendedRecipeList = (id) => {
    setShowExtendedRecipes(true)
    setSelectedCategory(id.toString())
  }

  const extendedCategoryList = (recipeId) => {
    setShowExtendedCategory(true)
    const recipe = recipes.find(r => r.id === recipeId)
    if (recipe) {
      setSelectedCategory(recipe.category_id.toString())
    }
  }


  if (loggedIn) {
    return (
     <div className="App">
  <div className="header">
    <h1>Welcome, {currentUser}!</h1>
    <button onClick={handleLogout} className="btn btn-danger">Logout</button>
  </div>

  <div className="button-group">
    <button onClick={getMyRecipes} className="btn btn-primary">My Recipes</button>
    <button onClick={getNotMyRecipes} className="btn btn-secondary">NOT my Recipes</button>
    <button onClick={showAllRecipes} className="btn btn-success">All Recipes</button>
    <button onClick={getMyCategories} className="btn btn-info">My Categories</button>
    <button onClick={getNotMyCategories} className="btn btn-secondary">NOT my Categories</button>
    <button onClick={showAllCategories} className="btn btn-warning">All Categories</button>
    <button onClick={() => {setShowExtendedRecipes(false); setShowExtendedCategory(false)}} className="btn btn-orange">Hide Extended</button>
  </div>
        
        <h2>Add New Recipe:</h2>
        <form onSubmit={handleAddRecipe}>
          <input
            type="text"
            placeholder="Recipe name"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            required
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            required
          >
            <option value="">Select category...</option>
            <option value="add_new">+ Add New Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button type="submit">Add Recipe</button>
        </form>

        {selectedCategory === 'add_new' && (
          <div style={{ marginTop: '20px', padding: '10px', border: '2px solid #4CAF50', borderRadius: '5px' }}>
            <h3>Create New Category:</h3>
            <input
              type="text"
              placeholder="Category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />
            <button onClick={async (e) => {
              e.preventDefault()
              await handleAddCategory(e)
              setSelectedCategory('')
            }}>
              Save Category
            </button>
            <button onClick={() => setSelectedCategory('')}>Cancel</button>
          </div>
        )}

        <h2>Categories:</h2>
        <ul>
          {categories.map(cat => (
            <li key={cat.id}>
              {cat.name}
              <button onClick={() => extendedRecipeList(cat.id)}>View Recipes</button>
            </li>
          ))}
        </ul>

        <h2>All Recipes:</h2>
<ul>
  {recipes.map(recipe => (
    <li key={recipe.id}>
      {editingRecipe === recipe.id ? (
        // EDIT MODE
        <div>
          <input 
            value={editRecipeName} 
            onChange={(e) => setEditRecipeName(e.target.value)} 
          />
          <select 
            value={editCategoryId} 
            onChange={(e) => setEditCategoryId(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <button onClick={() => handleUpdateRecipe(recipe.id)}>Save</button>
          <button onClick={() => setEditingRecipe(null)}>Cancel</button>
        </div>
      ) : (
        // VIEW MODE
        <div>
          {recipe.name} - {recipe.category.name} (by {recipe.user.username})
          <button onClick={() => extendedCategoryList(recipe.id)}>View Category</button>
          {recipe.user.username === currentUser && (
            <>
              <button onClick={() => {
                setEditingRecipe(recipe.id)
                setEditRecipeName(recipe.name)
                setEditCategoryId(recipe.category_id)
              }} className="btn btn-warning">
                Edit
              </button>
              <button onClick={() => handleDeleteRecipe(recipe.id)} className="btn btn-danger">
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </li>
  ))}
</ul>       

        {showExtendedRecipes && (
          <div>
            <h3>Recipes in Selected Category:</h3>
            <ol>
              {recipes
                .filter(r => r.category_id === parseInt(selectedCategory))
                .map(r => (
                  <li key={r.id}>{r.name}
                  </li>
                ))}
            </ol>
          </div>
        )}

        {showExtendedCategory && (
          <div>
            <h3>Selected Category:</h3>
            <ol>
              {categories
                .filter(c => c.id === parseInt(selectedCategory))
                .map(c => (
                  <li key={c.id}>{c.name}</li>
                ))}
            </ol>
          </div>
        )}
      </div>
    )
  }


return (
  <div className="App">
    <button onClick={onAutologin}>Auto Login</button>
    <h1>Recipe App {isRegister ? 'Register' : 'Login'}</h1>

    <form onSubmit={isRegister ? handleRegister : handleLogin}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
    </form>

    <p>
      {isRegister ? 'Already have an account? ' : 'Need an account? '}
      <button onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? 'Login' : 'Register'}
      </button>
    </p>

    {message && <p>{message}</p>}
  </div>
)
}

export default App