import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Tables } from '../types/supabase'

export interface AuthUser {
  id: string
  email: string
  name: string
  company: string
  position: string
  phone: string
  role: 'user' | 'admin' | 'manager'
  department: string | null
  avatar_url: string | null
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isOnboardingComplete: boolean
}

class SupabaseAuth {
  private static instance: SupabaseAuth
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isOnboardingComplete: false
  }
  private listeners: ((state: AuthState) => void)[] = []

  static getInstance(): SupabaseAuth {
    if (!SupabaseAuth.instance) {
      SupabaseAuth.instance = new SupabaseAuth()
    }
    return SupabaseAuth.instance
  }

  constructor() {
    this.initializeAuth()
  }

  private async initializeAuth() {
    // 現在のセッションを取得
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.user) {
      await this.setUserFromSession(session.user)
    }

    // 認証状態の変更を監視
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await this.setUserFromSession(session.user)
      } else if (event === 'SIGNED_OUT') {
        this.clearAuthState()
      }
    })
  }

  private async setUserFromSession(user: User) {
    try {
      // プロフィール情報を取得
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116はデータが見つからない
        console.error('Profile fetch error:', error)
        return
      }

      if (profile) {
        this.authState = {
          user: {
            id: profile.id,
            email: profile.email,
            name: profile.full_name || user.email || '',
            company: profile.company || '',
            position: profile.position || '',
            phone: profile.phone || '',
            role: profile.role,
            department: profile.department,
            avatar_url: profile.avatar_url
          },
          isAuthenticated: true,
          isOnboardingComplete: true
        }
      } else {
        // プロフィールが存在しない場合、基本的なユーザー情報のみ設定
        this.authState = {
          user: {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.email || '',
            company: user.user_metadata?.company || '',
            position: user.user_metadata?.position || '',
            phone: user.user_metadata?.phone || '',
            role: 'user',
            department: null,
            avatar_url: null
          },
          isAuthenticated: true,
          isOnboardingComplete: false
        }
      }

      this.notifyListeners()
    } catch (error) {
      console.error('Error setting user from session:', error)
    }
  }

  private clearAuthState() {
    this.authState = {
      user: null,
      isAuthenticated: false,
      isOnboardingComplete: false
    }
    this.notifyListeners()
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState))
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        await this.setUserFromSession(data.user)
        return { success: true }
      }

      return { success: false, error: 'ログインに失敗しました' }
    } catch (error: any) {
      return { success: false, error: error.message || 'ログインに失敗しました' }
    }
  }

  async register(userData: {
    email: string
    password: string
    name: string
    company: string
    position: string
    phone: string
    department: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Supabase Authでユーザーを作成
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name,
            company: userData.company,
            position: userData.position,
            phone: userData.phone,
            department: userData.department
          }
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      if (data.user) {
        // プロフィールテーブルにユーザー情報を保存
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            full_name: userData.name,
            company: userData.company,
            position: userData.position,
            phone: userData.phone,
            department: userData.department,
            role: 'user',
            avatar_url: null
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // プロフィール作成に失敗しても認証は成功とする
        }

        // 自動ログイン
        await this.setUserFromSession(data.user)
        return { success: true }
      }

      return { success: false, error: '登録に失敗しました' }
    } catch (error: any) {
      return { success: false, error: error.message || '登録に失敗しました' }
    }
  }

  async logout(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { success: false, error: error.message }
      }

      this.clearAuthState()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'ログアウトに失敗しました' }
    }
  }

  async updateProfile(updates: Partial<AuthUser>): Promise<{ success: boolean; data?: AuthUser; error?: string }> {
    try {
      const currentUser = this.authState.user
      if (!currentUser) {
        return { success: false, error: 'ユーザーが見つかりません' }
      }

      // プロフィールテーブルを更新
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.name || currentUser.name,
          role: updates.role || currentUser.role,
          department: updates.department || currentUser.department,
          avatar_url: updates.avatar_url || currentUser.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      // ローカル状態を更新
      const updatedUser = {
        ...currentUser,
        ...updates
      }

      this.authState.user = updatedUser
      this.notifyListeners()

      return { success: true, data: updatedUser }
    } catch (error: any) {
      return { success: false, error: error.message || 'プロフィール更新に失敗しました' }
    }
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'パスワードリセットに失敗しました' }
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.authState.user
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated
  }

  getAuthState(): AuthState {
    return this.authState
  }
}

export const supabaseAuth = SupabaseAuth.getInstance()
export type { AuthUser, AuthState }
